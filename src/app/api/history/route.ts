import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`${BACKEND_URL}/api/readings/`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch from backend');
    const data = await res.json();

    // Python is formatting it perfectly now, just pass it through!
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('History Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing reading ID' }, { status: 400 });

    // Pass the DELETE request to FastAPI
    const res = await fetch(`${BACKEND_URL}/api/readings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete from backend');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('History Delete Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}