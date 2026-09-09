import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Proxies the request straight to your FastAPI backend
    const res = await fetch(`${BACKEND_URL}/api/consultations/stats`, {
      headers: { Authorization: authHeader },
      cache: 'no-store' 
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("FastAPI STATS Error:", errorData);
      throw new Error(`Failed to fetch stats: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Stats Proxy GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}