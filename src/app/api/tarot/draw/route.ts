import { NextRequest, NextResponse } from 'next/server';
import { SPREADS, drawCards } from '@/lib/tarot';

export async function POST(req: NextRequest) {
  try {
    const { spreadId } = await req.json();

    if (!spreadId) {
      return NextResponse.json({ error: 'Spread ID is required' }, { status: 400 });
    }

    const spread = SPREADS.find((s) => s.id === spreadId);
    if (!spread) {
      return NextResponse.json({ error: 'Invalid spread ID' }, { status: 400 });
    }

    // Call the master function we perfected in lib/tarot.ts
    // This perfectly shuffles the deck and returns the full card objects (with the .img property!)
    const drawnCards = drawCards(spread);

    return NextResponse.json({ draw: drawnCards });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to draw cards' }, { status: 500 });
  }
}