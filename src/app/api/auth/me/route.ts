import { NextRequest, NextResponse } from 'next/server';
import { userStore } from '../register/route';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const emailPart = token.split('-').pop() || '';
  const existing = userStore[emailPart.toLowerCase()];

  const user = existing || {
    id: 'user-pr-1',
    name: 'Specialist Reader',
    email: emailPart || 'reader@example.com',
    role: 'Palm Reader Specialist',
  };

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
