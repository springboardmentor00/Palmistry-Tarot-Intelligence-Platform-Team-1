import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`${BACKEND_URL}/api/notifications/`, {
      headers: { Authorization: authHeader },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}