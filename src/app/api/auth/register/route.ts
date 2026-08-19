import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    let name = '';
    let email = '';
    let role = 'user';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      name = body.name || '';
      email = body.email || '';
      role = body.role || 'user';
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await req.formData();
      name = formData.get('name')?.toString() || '';
      email = formData.get('email')?.toString() || '';
      role = formData.get('role')?.toString() || 'user';
    }

    if (!email) {
      return NextResponse.json({ detail: 'Email is required' }, { status: 400 });
    }

    const userId = 'user_' + Math.random().toString(36).substring(2, 9);
    const token = 'mock_jwt_token_' + Date.now();

    const user = {
      id: userId,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      role,
    };

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user,
    });
  } catch (error: any) {
    console.error('Registration route error:', error);
    return NextResponse.json({ detail: error?.message || 'Registration failed' }, { status: 500 });
  }
}
