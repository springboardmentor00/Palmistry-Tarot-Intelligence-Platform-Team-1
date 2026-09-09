import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function PATCH(req: NextRequest, context: any) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const res = await fetch(`${BACKEND_URL}/api/notifications/${params.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: authHeader },
    });

    if (!res.ok) throw new Error('Failed to mark read');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}