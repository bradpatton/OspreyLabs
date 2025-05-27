import { NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import JobApplicationsService from '@/lib/services/jobApplications';

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

// GET - Fetch job applications (admin only)
export async function GET(request: Request) {
  try {
    const { isValid } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired' | null;
    const position = searchParams.get('position');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const search = searchParams.get('search');

    let applications;

    if (search) {
      applications = await JobApplicationsService.searchApplications(search, {
        limit,
        offset,
      });
    } else {
      applications = await JobApplicationsService.getAllApplications({
        status: status || undefined,
        position: position || undefined,
        limit,
        offset,
      });
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST - Create new job application
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      position,
      experience_level,
      resume_url,
      cover_letter,
      linkedin_url,
      portfolio_url,
    } = body;
    
    // Validate required fields
    if (!first_name || !last_name || !email || !position) {
      return NextResponse.json(
        { error: 'First name, last name, email, and position are required' },
        { status: 400 }
      );
    }

    // Get client information
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const application = await JobApplicationsService.createApplication({
      first_name,
      last_name,
      email,
      phone,
      position,
      experience_level,
      resume_url,
      cover_letter,
      linkedin_url,
      portfolio_url,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
    
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}

// PUT - Update job application (admin only)
export async function PUT(request: Request) {
  try {
    const { isValid, user } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    let application;

    if (status) {
      application = await JobApplicationsService.updateApplicationStatus(
        id,
        status,
        user?.id,
        notes
      );
    } else if (notes !== undefined) {
      application = await JobApplicationsService.updateApplicationNotes(
        id,
        notes,
        user?.id
      );
    } else {
      return NextResponse.json({ error: 'Status or notes must be provided' }, { status: 400 });
    }
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

// DELETE - Delete job application (admin only)
export async function DELETE(request: Request) {
  try {
    const { isValid } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const deleted = await JobApplicationsService.deleteApplication(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting job application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
} 