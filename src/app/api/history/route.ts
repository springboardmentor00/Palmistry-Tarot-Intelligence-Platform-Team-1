import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') ?? 'demo-user';

    // Get or create demo user
    let user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await db.user.create({
        data: {
          id: userId,
          name: 'Seeker',
          role: 'user',
        },
      });
    }

    const [palmReadings, tarotReadings, insights] = await Promise.all([
      db.palmReading.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      db.tarotReading.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      db.insight.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      user,
      palmReadings,
      tarotReadings,
      insights,
    });
  } catch (err) {
    console.error('History fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const id = url.searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    if (type === 'palm') {
      await db.palmReading.delete({ where: { id } });
    } else if (type === 'tarot') {
      await db.tarotReading.delete({ where: { id } });
    } else if (type === 'insight') {
      await db.insight.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
