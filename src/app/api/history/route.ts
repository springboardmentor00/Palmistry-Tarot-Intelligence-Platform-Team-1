import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/api/readings/`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch history from backend' },
        { status: res.status }
      );
    }

    const readings = await res.json();

    const palmReadings: any[] = [];
    const tarotReadings: any[] = [];

    for (const r of readings) {
      let raw: any = {};
      try {
        raw = typeof r.rawData === 'string' ? JSON.parse(r.rawData) : (r.rawData || {});
      } catch {
        raw = {};
      }

      if (r.readingType === 'palm') {
        palmReadings.push({
          id: r.id,
          handType: raw.handType || 'right',
          summary: r.summary,
          personalitySynthesis: r.personalitySynthesis || '',
          lines: raw.lines || {},
          imageUrl: r.imageUrl || null,
          createdAt: r.createdAt,
        });
      } else if (r.readingType === 'tarot') {
        const draw = Array.isArray(raw.draw) ? raw.draw : [];
        tarotReadings.push({
          id: r.id,
          spreadType: raw.spreadName || 'Three Card Spread',
          question: raw.question || null,
          draw: draw,
          interpretation: r.personalitySynthesis || r.summary,
          summary: r.summary,
          createdAt: r.createdAt,
        });
      }
    }

    return NextResponse.json({
      user: { id: 'current', name: 'Seeker' },
      palmReadings,
      tarotReadings,
      insights: [],
    });
  } catch (error: any) {
    console.error('History Fetch Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing reading ID' }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/api/readings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to delete reading' },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('History Delete Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete reading' },
      { status: 500 }
    );
  }
}