import { NextResponse } from 'next/server';

export async function POST() {
  // 1.5-second delay to trigger button loading states
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return NextResponse.json({
    user: {
      id: "mock-user-123",
      name: "UI Developer",
      email: "dev@team.local",
      role: "user"
    },
    token: "mock-jwt-token-ui-shell"
  });
}