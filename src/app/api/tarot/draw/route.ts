import { NextResponse } from 'next/server';

export async function POST() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    spread: { name: "Mock Spread", cardCount: 3 },
    draw: [
      { cardId: "major-1", cardName: "The Magician", arcana: "major", symbol: "🎩", orientation: "upright", position: "Past", keywords: ["manifestation"] },
      { cardId: "major-0", cardName: "The Fool", arcana: "major", symbol: "🃏", orientation: "upright", position: "Present", keywords: ["new beginnings"] },
      { cardId: "major-7", cardName: "The Chariot", arcana: "major", symbol: "🏎️", orientation: "upright", position: "Future", keywords: ["victory"] }
    ]
  });
}