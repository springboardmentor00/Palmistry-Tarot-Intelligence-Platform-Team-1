import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // 1. Grab the authorization header sent directly by useAuthedFetch
    let authHeader = request.headers.get('authorization');

    // 2. Fallback to checking standard cookies
    if (!authHeader) {
      // FIX: You MUST await cookies() in newer Next.js versions
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // 3. Forward the request to FastAPI
    const response = await fetch(`${backendUrl}/api/admin/palm-analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      cache: 'no-store' 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend returned ${response.status}: ${errorText}`);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy Error for Palm Analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}