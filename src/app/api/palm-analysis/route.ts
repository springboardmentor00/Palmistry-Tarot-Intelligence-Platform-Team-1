import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Base URL of your Python PyTorch backend
const PALMISTRY_API_URL = process.env.PALMISTRY_API_URL || 'http://localhost:8001';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

interface PalmLinePrediction {
  detected: boolean;
  confidence: number;
  points: [number, number][];
}

interface PalmistryApiResponse {
  success: boolean;
  model: string;
  message: string;
  filename: string;
  lines: {
    life_line: PalmLinePrediction;
    head_line: PalmLinePrediction;
    heart_line: PalmLinePrediction;
    fate_line: PalmLinePrediction;
    sun_line: PalmLinePrediction;
  };
}

interface PalmAnalysisRequestBody {
  image: string;
  handType: 'left' | 'right';
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; extension: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data URL');
  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');
  const extension = mimeType.split('/')[1] || 'png';
  return { blob: new Blob([buffer], { type: mimeType }), extension };
}

function describeConfidence(confidence: number): string {
  if (confidence >= 0.85) return 'very clearly defined';
  if (confidence >= 0.6) return 'reasonably well defined';
  if (confidence >= 0.35) return 'faint and hard to trace';
  return 'barely visible in this image';
}

function describeLine(name: string, line: PalmLinePrediction, handType: 'left' | 'right'): string {
  if (!line.detected) {
    return `The ${name} could not be confidently detected on your ${handType} hand from this photo.`;
  }
  const pct = Math.round(line.confidence * 100);
  return `Your ${name} is ${describeConfidence(line.confidence)} on your ${handType} hand (confidence ${pct}%).`;
}

export async function POST(req: NextRequest) {
  try {
    const body: PalmAnalysisRequestBody = await req.json();
    const { image, handType } = body;

    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    const hand: 'left' | 'right' = handType === 'left' ? 'left' : 'right';

    const { blob, extension } = dataUrlToBlob(image);
    const formData = new FormData();
    formData.append('file', blob, `palm.${extension}`);

    // 1. Send image to Python Backend (Port 8001)
    const apiResponse = await fetch(`${PALMISTRY_API_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(120_000),
    });

    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Palm analysis vision service failed' }, { status: 502 });
    }

    const prediction = (await apiResponse.json()) as PalmistryApiResponse;
    const { lines } = prediction;
    console.log("RAW PYTHON DATA:", JSON.stringify(prediction.lines, null, 2));

    // 2. Format the Python metrics into a prompt for Gemini
    const lineDescriptions = [
      describeLine('life line', lines.life_line, hand),
      describeLine('heart line', lines.heart_line, hand),
      describeLine('head line', lines.head_line, hand),
      describeLine('fate line', lines.fate_line, hand),
      describeLine('sun line', lines.sun_line, hand),
    ].join('\n');

    // 3. Ask Gemini to synthesize a mystical reading based on the computer vision data
    const prompt = `You are an expert palm reader. I have used a computer vision model to scan a user's ${hand} hand. 
Here is the technical data from the scan:

${lineDescriptions}

Write a short, engaging, and mystical 2-paragraph personality synthesis based ONLY on these line strengths. 
Keep it under 150 words. Do not list the confidence percentages, just interpret what strong/faint/missing lines mean for their life, heart, mind, and fate.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
      generationConfig: { maxOutputTokens: 4096, temperature: 0.7 }
    });

    const resultAI = await model.generateContent(prompt);
    const personality = resultAI.response.text();

    const detectedLines = Object.values(lines).filter((l) => l.detected);
    const summary = prediction.success
      ? `${detectedLines.length} of 5 palm lines were successfully analyzed on your ${hand} hand. Here is your AI-synthesized reading.`
      : 'The palm analysis service could not process this image fully. Please try a clearer photo.';

    const recommendations = [
      'For a more precise reading, use natural daylight.',
      'Ensure your palm is flat and fully visible inside the scanner box.'
    ];

    // --- NEW CODE: Save Reading to PostgreSQL via FastAPI ---
    const authHeader = req.headers.get('authorization'); // Grab the JWT token from the frontend
    
    if (authHeader) {
      try {
        await fetch('http://localhost:8000/api/readings/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader // Pass the token so FastAPI knows who the user is
          },
          body: JSON.stringify({
            readingType: 'palm',
            summary: summary,
            personalitySynthesis: personality,
            rawData: {
              handType: hand,
              lines: lines
            }
          })
        });
        console.log("Reading successfully saved to database!");
      } catch (dbError) {
        console.error('Failed to save reading to DB, but continuing:', dbError);
      }
    }
    // --- END NEW CODE ---

    // 4. Return everything to the frontend UI
    return NextResponse.json({
      summary,
      lifeLine: describeLine('life line', lines.life_line, hand),
      heartLine: describeLine('heart line', lines.heart_line, hand),
      headLine: describeLine('head line', lines.head_line, hand),
      fateLine: describeLine('fate line', lines.fate_line, hand),
      sunLine: describeLine('sun line', lines.sun_line, hand),
      personality, // This is now dynamically generated by Gemini!
      recommendations,
      id: crypto.randomUUID(),
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze palm' }, { status: 500 });
  }
}