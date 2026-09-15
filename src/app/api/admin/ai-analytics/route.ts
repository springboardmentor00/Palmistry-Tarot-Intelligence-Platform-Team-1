import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    let authHeader = request.headers.get('authorization');

    if (!authHeader) {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/api/admin/ai-analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      cache: 'no-store' 
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy Error for AI Analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}