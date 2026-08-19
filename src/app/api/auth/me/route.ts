import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: 'user_123',
      name: 'Mystica User',
      email: 'user@mystica.local',
      role: 'user',
    },
  });
}
