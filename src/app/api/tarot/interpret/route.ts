import { NextRequest, NextResponse } from 'next/server';
import { CARD_BY_ID } from '@/lib/tarot';

export async function POST(req: NextRequest) {
  try {
    const { spreadName, question, draw } = await req.json();

    if (!draw || draw.length === 0) {
      return NextResponse.json({ error: 'No cards provided' }, { status: 400 });
    }

    // Simulate AI "thinking" time for the UI loading state to look authentic
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Gather the names of the cards for the summary
    const cardNames = draw.map((d: any) => CARD_BY_ID[d.cardId]?.name).join(', ');

    // Start building a dynamic narrative
    let interpretation = `Your ${spreadName} reveals a compelling narrative through the energies of the ${cardNames}.\n\n`;
    
    if (question) {
      interpretation += `Regarding your inquiry ("${question}"), the cards suggest the following path:\n\n`;
    }

    // Loop through each card drawn and grab its specific meaning from our dictionary
    draw.forEach((d: any) => {
      const card = CARD_BY_ID[d.cardId];
      if (card) {
        // Use the rich upright/reversed meanings we set up in lib/tarot.ts
        const meaning = d.orientation === 'upright' ? card.upright : card.reversed;
        interpretation += `**${d.position} — ${card.name} (${d.orientation})**\n${meaning}\n\n`;
      }
    });

    interpretation += `Take these insights and reflect on how they align with your current path. The energy of these cards serves as a guide, but your own free will determines the ultimate outcome.`;

    const summary = `Your reading centers around the energies of ${cardNames}.`;

    return NextResponse.json({
      interpretation,
      summary,
      id: crypto.randomUUID(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to interpret cards' }, { status: 500 });
  }
}