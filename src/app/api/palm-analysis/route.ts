import { NextResponse } from 'next/server';

export async function POST() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return NextResponse.json({
    summary: "[MOCK DATA] The UI is working perfectly. This is a simulated palm reading.",
    lifeLine: "[MOCK DATA] Strong vitality indicated by a deep, unbroken line.",
    heartLine: "[MOCK DATA] Clear emotional boundaries and empathetic nature.",
    headLine: "[MOCK DATA] Highly analytical thinking, suitable for complex engineering.",
    fateLine: "[MOCK DATA] A clear destiny driven by independent choices.",
    personality: "[MOCK DATA] You are a pragmatic problem solver who values logic and structure.",
    recommendations: ["Test the UI components", "Verify responsive design", "Check dark mode styling"],
    rawAnalysis: "Mock raw data string",
    id: "mock-palm-id-123"
  });
}