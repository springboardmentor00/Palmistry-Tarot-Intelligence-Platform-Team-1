import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    user: { id: "mock-user-123", name: "UI Developer" },
    palmReadings: [
      { id: "1", createdAt: new Date().toISOString(), summary: "[MOCK] Yesterday's palm reading." },
      { id: "2", createdAt: new Date(Date.now() - 86400000).toISOString(), summary: "[MOCK] Last week's palm reading." }
    ],
    tarotReadings: [
      { id: "3", createdAt: new Date().toISOString(), spreadType: "three-card", summary: "[MOCK] Recent 3-card spread." }
    ],
    insights: [
      { id: "4", createdAt: new Date().toISOString(), type: "personality", title: "Mock Trait", content: "You like clean code." }
    ]
  });
}

// Add a mock DELETE route just in case the UI has "delete reading" buttons
export async function DELETE() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return NextResponse.json({ ok: true });
}