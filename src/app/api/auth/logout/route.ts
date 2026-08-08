import { NextResponse } from 'next/server';

export async function POST() {
  // Short delay for UI transition
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return NextResponse.json({ ok: true });
}