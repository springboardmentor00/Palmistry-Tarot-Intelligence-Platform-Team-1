import { NextRequest, NextResponse } from 'next/server';

// Base URL of the Palmistry AI FastAPI service (see mini-services/palmistry-ai).
// Falls back to the default local dev port used by `uvicorn dummy_api:app`.
const PALMISTRY_API_URL =
  process.env.PALMISTRY_API_URL || 'http://localhost:8001';

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
  image: string; // data URL, e.g. "data:image/png;base64,...."
  handType: 'left' | 'right';
}

// Converts a "data:image/png;base64,AAAA..." string into a Blob the
// FastAPI /predict endpoint can accept as multipart/form-data.
function dataUrlToBlob(dataUrl: string): { blob: Blob; extension: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image data URL');
  }
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

// Turns the raw model output for a single line into a short, readable
// sentence for the UI. The current model is a dummy/placeholder — this
// mapping is intentionally simple and is meant to be swapped out once the
// real segmentation + interpretation model is wired in.
function describeLine(name: string, line: PalmLinePrediction, handType: 'left' | 'right'): string {
  if (!line.detected) {
    return `The ${name} could not be confidently detected on your ${handType} hand from this photo. Try a clearer, well-lit shot with the palm fully open.`;
  }
  const pct = Math.round(line.confidence * 100);
  return `Your ${name} is ${describeConfidence(line.confidence)} on your ${handType} hand (confidence ${pct}%), traced across ${line.points.length} key points.`;
}

export async function POST(req: NextRequest) {
  let body: PalmAnalysisRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { image, handType } = body;

  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }
  const hand: 'left' | 'right' = handType === 'left' ? 'left' : 'right';

  let blob: Blob;
  let extension: string;
  try {
    ({ blob, extension } = dataUrlToBlob(image));
  } catch {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
  }

  const formData = new FormData();
  formData.append('file', blob, `palm.${extension}`);

  let apiResponse: Response;
  try {
    apiResponse = await fetch(`${PALMISTRY_API_URL}/predict`, {
      method: 'POST',
      body: formData,
      // The dummy model is fast, but keep a generous timeout for the real
      // model once it's swapped in.
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    console.error('Failed to reach Palmistry AI service:', err);
    return NextResponse.json(
      {
        error:
          'Could not reach the palm analysis service. Make sure the ' +
          'Palmistry AI API is running (see mini-services/palmistry-ai).',
      },
      { status: 502 }
    );
  }

  if (!apiResponse.ok) {
    const text = await apiResponse.text().catch(() => '');
    console.error('Palmistry AI service error:', apiResponse.status, text);
    return NextResponse.json(
      { error: 'Palm analysis service returned an error' },
      { status: 502 }
    );
  }

  const prediction = (await apiResponse.json()) as PalmistryApiResponse;
  const { lines } = prediction;

  const detectedLines = Object.values(lines).filter((l) => l.detected);
  const avgConfidence =
    detectedLines.length > 0
      ? detectedLines.reduce((sum, l) => sum + l.confidence, 0) / detectedLines.length
      : 0;

  const summary = prediction.success
    ? `${detectedLines.length} of 5 palm lines were detected on your ${hand} hand, with an average confidence of ${Math.round(avgConfidence * 100)}%. Read below for a line-by-line breakdown.`
    : 'The palm analysis service could not process this image. Please try a clearer photo.';

  const recommendations: string[] = [];
  if (!lines.life_line.detected || lines.life_line.confidence < 0.6) {
    recommendations.push('Retake the photo with the palm fully open and evenly lit to improve life line detection.');
  }
  if (!lines.sun_line.detected) {
    recommendations.push('The sun line is naturally faint for many people — this is common and not a cause for concern.');
  }
  if (avgConfidence >= 0.7) {
    recommendations.push('Your photo quality is great — this is ideal for a detailed reading.');
  } else {
    recommendations.push('For a more precise reading, use natural daylight and keep the hand steady.');
  }

  const result = {
    summary,
    lifeLine: describeLine('life line', lines.life_line, hand),
    heartLine: describeLine('heart line', lines.heart_line, hand),
    headLine: describeLine('head line', lines.head_line, hand),
    fateLine: describeLine('fate line', lines.fate_line, hand),
    personality:
      `Based on the detected line pattern (model: ${prediction.model}), this is a preliminary structural reading. ` +
      'A full personality synthesis will be generated once the trained interpretation model replaces the current placeholder.',
    recommendations,
    rawAnalysis: JSON.stringify(prediction, null, 2),
    id: crypto.randomUUID(),
  };

  return NextResponse.json(result);
}
