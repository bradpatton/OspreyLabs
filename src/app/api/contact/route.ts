import { NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import ContactSubmissionsService from '@/lib/services/contactSubmissions';

// Force this route to be dynamic (not pre-rendered during build)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to verify admin authentication
async function verifyAdminAuth(request: Request): Promise<{ isValid: boolean; user?: any }> {
  const adminKey = request.headers.get('x-admin-key');
  const sessionToken = request.headers.get('x-session-token');
  
  let user = null;
  
  if (sessionToken) {
    const sessionData = await AuthService.validateSession(sessionToken);
    if (sessionData) {
      user = sessionData.user;
    }
  } else if (adminKey) {
    user = await AuthService.validateApiKey(adminKey);
  }
  
  return { isValid: !!user, user };
}

// GET - Fetch contact submissions (admin only)
export async function GET(request: Request) {
  try {
    const { isValid } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'new' | 'read' | 'replied' | 'archived' | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const search = searchParams.get('search');

    let submissions;

    if (search) {
      submissions = await ContactSubmissionsService.searchSubmissions(search, {
        limit,
        offset,
      });
    } else {
      submissions = await ContactSubmissionsService.getAllSubmissions({
        status: status || undefined,
        limit,
        offset,
      });
    }

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// POST - Create new contact submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, message } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Get client information
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const submission = await ContactSubmissionsService.createSubmission({
      name,
      email,
      company,
      message,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
    
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error creating contact submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}

// PUT - Update contact submission (admin only)
export async function PUT(request: Request) {
  try {
    const { isValid, user } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const submission = await ContactSubmissionsService.updateSubmissionStatus(
      id,
      status,
      user?.id
    );
    
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error updating contact submission:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

// DELETE - Delete contact submission (admin only)
export async function DELETE(request: Request) {
  try {
    const { isValid } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const deleted = await ContactSubmissionsService.deleteSubmission(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
} 