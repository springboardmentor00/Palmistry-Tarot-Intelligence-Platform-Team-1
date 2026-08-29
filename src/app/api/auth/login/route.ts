import { NextRequest, NextResponse } from 'next/server';
import { userStore } from '../register/route';

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
      const json = await req.json();
      username = json.username || json.email || '';
      password = json.password || '';
    }

    const lowerEmail = username.toLowerCase();
    const existing = userStore[lowerEmail];

    // If user not in store, create a default session for seamless testing
    const userRole = existing?.role || (lowerEmail.includes('reader') ? 'Palm Reader Specialist' : 'Palm Reader Specialist');
    const userName = existing?.name || (lowerEmail.split('@')[0] || 'Palm Reader');
    const userId = existing?.id || `user-${Date.now()}`;

    const token = `mock-jwt-token-${Date.now()}-${lowerEmail}`;

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: userId,
        name: userName,
        email: lowerEmail,
        role: userRole,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Login failed' }, { status: 500 });
  }
}
