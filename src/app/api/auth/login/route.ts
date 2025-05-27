import { NextResponse } from 'next/server';
import AuthService from '@/lib/auth';

// POST - Login with username and password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user (returns user with API key)
    const user = await AuthService.authenticateUser({ username, password });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Get client information
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Create session (expires in 7 days)
    const session = await AuthService.createSession(
      user.id,
      user.api_key, // Use the API key from the authenticated user
      24 * 7, // 7 days
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      session: {
        token: session.session_token,
        expiresAt: session.expires_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 