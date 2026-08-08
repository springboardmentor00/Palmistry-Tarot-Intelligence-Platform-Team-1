import { NextResponse } from 'next/server';

export async function POST() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return NextResponse.json({
    interpretation: "[MOCK DATA] This is a simulated Tarot interpretation. The cards suggest that the frontend team is going to do an excellent job styling this text block. The Magician represents your ability to manifest this UI, while The Fool reminds you to take a leap of faith into microservices. The Chariot indicates rapid progress on the project.",
    summary: "[MOCK DATA] A positive reading indicating strong progress and manifestation.",
    id: "mock-tarot-id-456",
  });
}