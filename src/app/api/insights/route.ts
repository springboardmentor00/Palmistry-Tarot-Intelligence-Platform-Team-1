import { NextResponse } from 'next/server';

export async function POST() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return NextResponse.json({
    personality: { title: "Personality Profile", content: "[MOCK] You are detail-oriented and visionary." },
    trends: { title: "Life Trends", content: "[MOCK] You are transitioning from monoliths to microservices." },
    recommendations: { title: "Personalized Recommendations", content: "[MOCK] Keep building awesome UIs." },
    affirmation: "[MOCK] My frontend components render flawlessly on the first try."
  });
}