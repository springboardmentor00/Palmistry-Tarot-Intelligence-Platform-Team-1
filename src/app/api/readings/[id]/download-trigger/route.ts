import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8000';

export async function GET(req: NextRequest, context: any) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    
    // Pass the wristband to Python to trigger the database updates
    const res = await fetch(`${BACKEND_URL}/api/readings/${params.id}/download-trigger`, {
      headers: { 'Authorization': authHeader },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Failed to log trigger in Python');
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}