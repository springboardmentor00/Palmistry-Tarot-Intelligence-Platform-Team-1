import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const res = await fetch(`${BACKEND_URL}/api/consultations/${params.id}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('Failed to submit review');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Consultation Review Proxy PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}