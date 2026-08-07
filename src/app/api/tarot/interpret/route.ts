import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { CARD_BY_ID, type CardOrientation } from '@/lib/tarot';

export const runtime = 'nodejs';

interface DrawnCardPayload {
  cardId: string;
  orientation: CardOrientation;
  position: string;
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      spreadId,
      spreadName,
      question,
      draw,
    } = body as {
      spreadId: string;
      spreadName: string;
      question?: string;
      draw: DrawnCardPayload[];
    };

    if (!draw || !Array.isArray(draw) || draw.length === 0) {
      return NextResponse.json({ error: 'No cards drawn' }, { status: 400 });
    }

    // Build prompt with card details
    const cardList = draw
      .map((d, i) => {
        const card = CARD_BY_ID[d.cardId];
        if (!card) return null;
        const orientation = d.orientation;
        const meaning = orientation === 'upright' ? card.upright : card.reversed;
        return `${i + 1}. Position: "${d.position}" | Card: ${card.name} (${orientation}) | Element: ${card.element ?? 'n/a'} | Meaning: ${meaning}`;
      })
      .filter(Boolean)
      .join('\n');

    const systemPrompt = `You are a wise, compassionate tarot reader with deep knowledge of symbolism, archetypes, and the Rider-Waite tradition. Provide a rich, narrative interpretation of the spread.

${question ? `The seeker asks: "${question}"` : 'The seeker seeks general guidance.'}

Spread: ${spreadName}
Cards drawn:
${cardList}

Provide a flowing interpretation that:
1. Opens with the overall theme or energy of the reading (2-3 sentences)
2. Walks through each card in position order, weaving the meanings into a coherent narrative
3. Synthesizes how the cards interact and build on each other
4. Closes with actionable guidance and an empowering takeaway

Write in warm, evocative prose. Avoid bullet lists in the body. Honor both the light and shadow in each card. Keep total length 350-500 words.`;

    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a gifted tarot reader who weaves archetypal wisdom into clear, inspiring prose.',
        },
        { role: 'user', content: systemPrompt },
      ],
      thinking: { type: 'disabled' },
    });

    const interpretation = response.choices[0]?.message?.content ?? '';

    // Derive a short summary (first 1-2 sentences)
    const summary = interpretation.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');

    // Persist (user is already authenticated)
    let savedId: string | undefined;
    try {
      const record = await db.tarotReading.create({
        data: {
          userId: authUser.id,
          spreadType: spreadId,
          question: question ?? null,
          cardIds: JSON.stringify(draw.map((d) => d.cardId)),
          cardOrientations: JSON.stringify(
            draw.map((d) => (d.orientation === 'upright' ? true : false))
          ),
          interpretation,
          summary,
        },
      });
      savedId = record.id;
    } catch (e) {
      console.error('DB save failed (continuing):', e);
    }

    return NextResponse.json({
      interpretation,
      summary,
      id: savedId,
    });
  } catch (err) {
    console.error('Tarot interpret error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
