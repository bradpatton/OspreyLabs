import { NextResponse } from 'next/server';

// Verify admin API key
function verifyAdminKey(request: Request): boolean {
  const adminKey = request.headers.get('x-admin-key');
  const expectedKey = process.env.ADMIN_API_KEY;
  
  return adminKey === expectedKey;
}

// POST - Validate admin key
export async function POST(request: Request) {
  try {
    if (!verifyAdminKey(request)) {
      return NextResponse.json({ error: 'Invalid admin key' }, { status: 401 });
    }
    
    return NextResponse.json({ valid: true, message: 'Admin key is valid' });
  } catch (error) {
    console.error('Error validating admin key:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
} 