import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    // Stop the request immediately if React didn't send the token
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Forward the request to FastAPI
    const res = await fetch(`${BACKEND_URL}/api/notifications`, {
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorData = await res.text();
      return NextResponse.json({ error: errorData }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}