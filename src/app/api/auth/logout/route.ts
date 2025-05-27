import { NextResponse } from 'next/server';
import AuthService from '@/lib/auth';

// POST - Logout and invalidate session
export async function POST(request: Request) {
  try {
    const sessionToken = request.headers.get('x-session-token');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 400 }
      );
    }

    // Invalidate the session
    await AuthService.invalidateSession(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
} 