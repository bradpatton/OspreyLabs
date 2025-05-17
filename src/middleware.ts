import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect admin paths
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get the session cookie or token - in a real app we'd use a proper auth system
    // This is a simple example for demonstration purposes
    const session = request.cookies.get('admin_session');
    
    // If no session exists and not already on the login page, redirect to login
    if (!session?.value && !request.nextUrl.pathname.includes('/admin/login')) {
      // In a real app, this would redirect to a proper login page
      // For simplicity in this example, we'll use the chat-logs page with its own auth
      // You can replace this with a more robust auth system
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/admin/:path*'],
}; 