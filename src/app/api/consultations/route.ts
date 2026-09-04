import { NextRequest, NextResponse } from 'next/server';

// 1. CRITICAL: Force Next.js to NEVER cache this route so the queue updates live
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`${BACKEND_URL}/api/consultations/`, {
      headers: { Authorization: authHeader },
      // Force fetch to bypass cache as well
      cache: 'no-store' 
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("FastAPI GET Error:", errorData);
      throw new Error(`Failed to fetch consultations: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Consultations Proxy GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    
    // Safety log to see what the frontend is actually sending
    console.log("Submitting Consultation Payload:", body);

    const res = await fetch(`${BACKEND_URL}/api/consultations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("FastAPI POST Error:", errorData);
      throw new Error(`Failed to create consultation: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Consultations Proxy POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}