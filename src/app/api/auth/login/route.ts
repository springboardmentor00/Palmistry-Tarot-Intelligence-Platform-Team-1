import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let username = '';
    let password = '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      username = formData.get('username')?.toString() || '';
      password = formData.get('password')?.toString() || '';
    } else {
      const body = await req.json().catch(() => ({}));
      username = body.username || body.email || '';
      password = body.password || '';
    }

    if (!username) {
      return NextResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }

    const userId = 'user_' + Math.random().toString(36).substring(2, 9);
    const token = 'mock_jwt_token_' + Date.now();

    const user = {
      id: userId,
      name: username.split('@')[0] || 'User',
      email: username.toLowerCase(),
      role: 'user',
    };

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user,
    });
  } catch (error) {
    return NextResponse.json({ detail: 'Login failed' }, { status: 500 });
  }
}
