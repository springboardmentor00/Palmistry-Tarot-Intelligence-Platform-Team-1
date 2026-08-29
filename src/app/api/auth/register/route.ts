import { NextRequest, NextResponse } from 'next/server';

export const userStore: Record<string, { id: string; name: string; email: string; role: string; password: string }> = {
  'reader@example.com': {
    id: 'user-pr-1',
    name: 'Specialist Reader',
    email: 'reader@example.com',
    role: 'Palm Reader Specialist',
    password: 'password123',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ detail: 'Missing required fields' }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase();
    userStore[lowerEmail] = {
      id: `user-${Date.now()}`,
      name,
      email: lowerEmail,
      role: role || 'Palm Reader Specialist',
      password,
    };

    const token = `mock-jwt-token-${Date.now()}-${lowerEmail}`;

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: userStore[lowerEmail].id,
        name,
        email: lowerEmail,
        role: userStore[lowerEmail].role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Registration failed' }, { status: 500 });
  }
}
