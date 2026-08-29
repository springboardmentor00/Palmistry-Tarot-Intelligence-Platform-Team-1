import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CARD_BY_ID } from '@/lib/tarot';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { spreadName, question, draw } = await req.json();

    if (!draw || draw.length === 0) {
      return NextResponse.json({ error: 'No cards provided' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in .env' },
        { status: 500 }
      );
    }

    // Format the drawn cards with their position and orientation for the LLM
    const cardBreakdown = draw
      .map((d: any) => {
        const card = CARD_BY_ID[d.cardId];
        const name = card?.name || d.cardId;
        const orientation = d.orientation || 'upright';
        const position = d.position || 'Position';
        const keywords = card?.keywords ? card.keywords.join(', ') : '';

        return `- **${position}**: ${name} (${orientation}) ${keywords ? `[Themes: ${keywords}]` : ''}`;
      })
      .join('\n');

    // ... (keep the cardBreakdown map logic exactly the same)

    const prompt = `You are an intuitive, direct Tarot reader. 
Provide a structured reading for this spread:

Spread Type: ${spreadName}
${question ? `Question: "${question}"` : 'Inquiry: General Guidance'}

Cards Drawn:
${cardBreakdown}

Guidelines:
- 1. The Breakdown: For EVERY card, write exactly ONE concise sentence explaining its meaning in its specific position. Format strictly as: "**[Position] - [Card Name]:** [Your short sentence]"
- 2. The Synthesis: End with an "### Overall Summary" section containing 3 to 4 punchy sentences weaving the whole story together.
- 3. Keep the entire response impactful and moving fast. Do not write long, fluffy introductions.`;

    // CHANGED: Added generationConfig to limit tokens and speed up response time
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        maxOutputTokens: 4096, // Caps the length, forcing lightning-fast responses
        temperature: 0.7,
      }
    });

    const result = await model.generateContent(prompt);
    const interpretation = result.response.text();

    // ... (keep the rest of the return statement the same)

    const cardNames = draw
      .map((d: any) => CARD_BY_ID[d.cardId]?.name)
      .filter(Boolean)
      .join(', ');

    const summary = `A ${spreadName} reading guided by ${cardNames}.`;

    // --- NEW CODE: Save Tarot Reading to PostgreSQL via FastAPI ---
    const authHeader = req.headers.get('authorization');
    
    if (authHeader) {
      try {
        await fetch('http://localhost:8000/api/readings/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            readingType: 'tarot',
            summary: summary,
            personalitySynthesis: interpretation, // Gemini's full output
            rawData: {
              spreadName: spreadName,
              question: question || null,
              draw: draw // Stores exactly which cards were drawn and how they were oriented
            }
          })
        });
        console.log("Tarot reading successfully saved to database!");
      } catch (dbError) {
        console.error('Failed to save tarot reading to DB, but continuing:', dbError);
      }
    }
    // --- END NEW CODE ---

    return NextResponse.json({
      interpretation,
      summary,
      id: crypto.randomUUID(),
    });
  } catch (error: any) {
    console.error('Tarot Interpretation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate AI interpretation' },
      { status: 500 }
    );
  }
}