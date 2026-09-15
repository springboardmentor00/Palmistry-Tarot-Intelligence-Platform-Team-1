import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`${BACKEND_URL}/api/profile/`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) throw new Error('Failed to fetch profile from backend');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Profile Proxy GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const res = await fetch(`${BACKEND_URL}/api/profile/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('Failed to save profile to backend');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Profile Proxy POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}