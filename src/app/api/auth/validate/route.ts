import { NextResponse } from 'next/server';
import AuthService from '@/lib/auth';

// POST - Validate admin key or session token
export async function POST(request: Request) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    const sessionToken = request.headers.get('x-session-token');
    
    let user = null;
    
    // Try to validate session token first, then API key
    if (sessionToken) {
      const sessionData = await AuthService.validateSession(sessionToken);
      if (sessionData) {
        user = sessionData.user;
      }
    } else if (adminKey) {
      user = await AuthService.validateApiKey(adminKey);
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      valid: true, 
      message: 'Authentication successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error validating credentials:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
} 