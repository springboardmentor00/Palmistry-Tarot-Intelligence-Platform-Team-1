import { NextResponse } from 'next/server';

export async function GET() {
  // A short 500ms delay to allow skeleton loaders to flash briefly on page load
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    user: {
      id: "mock-user-123",
      name: "UI Developer",
      email: "dev@team.local",
      role: "user"
    }
  });
}