import { NextRequest, NextResponse } from 'next/server';
import { SPREADS, drawCards, type SpreadDefinition } from '@/lib/tarot';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spreadId, seed } = body as { spreadId: string; seed?: number };

    const spread: SpreadDefinition | undefined = SPREADS.find((s) => s.id === spreadId);
    if (!spread) {
      return NextResponse.json({ error: 'Unknown spread' }, { status: 400 });
    }

    const draw = drawCards(spread, seed);
    return NextResponse.json({
      spread,
      draw: draw.map((d) => ({
        cardId: d.card.id,
        cardName: d.card.name,
        arcana: d.card.arcana,
        suit: d.card.suit,
        symbol: d.card.symbol,
        orientation: d.orientation,
        position: d.position,
        keywords: d.card.keywords,
        upright: d.card.upright,
        reversed: d.card.reversed,
      })),
    });
  } catch (err) {
    console.error('Tarot draw error:', err);
    return NextResponse.json({ error: 'Failed to draw cards' }, { status: 500 });
  }
}
