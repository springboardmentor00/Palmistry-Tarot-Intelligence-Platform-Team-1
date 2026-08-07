import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const [palmReadings, tarotReadings, insights] = await Promise.all([
      db.palmReading.findMany({
        where: { userId: authUser.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      db.tarotReading.findMany({
        where: { userId: authUser.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      db.insight.findMany({
        where: { userId: authUser.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      user: authUser,
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
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const id = url.searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    if (type === 'palm') {
      // Ensure the reading belongs to the user
      const existing = await db.palmReading.findUnique({ where: { id } });
      if (!existing || existing.userId !== authUser.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      await db.palmReading.delete({ where: { id } });
    } else if (type === 'tarot') {
      const existing = await db.tarotReading.findUnique({ where: { id } });
      if (!existing || existing.userId !== authUser.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      await db.tarotReading.delete({ where: { id } });
    } else if (type === 'insight') {
      const existing = await db.insight.findUnique({ where: { id } });
      if (!existing || existing.userId !== authUser.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
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
