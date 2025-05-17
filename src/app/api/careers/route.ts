import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the storage file path
const STORAGE_DIR = path.join(process.cwd(), 'logs');
const JOB_APPLICATIONS_FILE = path.join(STORAGE_DIR, 'job-applications.json');

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch (error) {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Interface for job application
interface JobApplication {
  id: string;
  jobId: string | null;
  jobTitle: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedIn: string;
  portfolio: string;
  resumeFileName: string;
  coverLetter: string;
  heardAbout: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  status: 'new' | 'reviewed' | 'interviewing' | 'rejected' | 'hired';
}

// Function to get existing applications
async function getExistingApplications(): Promise<JobApplication[]> {
  try {
    await ensureStorageDir();
    
    try {
      const data = await fs.readFile(JOB_APPLICATIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File might not exist yet
      return [];
    }
  } catch (error) {
    console.error('Error reading job applications:', error);
    return [];
  }
}

// Function to write applications
async function writeApplications(applications: JobApplication[]) {
  try {
    await ensureStorageDir();
    await fs.writeFile(JOB_APPLICATIONS_FILE, JSON.stringify(applications, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing job applications:', error);
  }
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// POST endpoint to add a new application
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string || '';
    const linkedIn = formData.get('linkedIn') as string || '';
    const portfolio = formData.get('portfolio') as string || '';
    const coverLetter = formData.get('coverLetter') as string || '';
    const heardAbout = formData.get('heardAbout') as string || '';
    const jobId = formData.get('jobId') as string || null;
    const jobTitle = formData.get('jobTitle') as string || null;
    
    // Get resume file
    const resumeFile = formData.get('resume') as File;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !resumeFile) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }
    
    // In a real application, you would save the resume file to storage
    // For this demo, we'll just store the filename
    const resumeFileName = resumeFile.name;
    
    // Create application entry
    const application: JobApplication = {
      id: generateId(),
      jobId,
      jobTitle,
      firstName,
      lastName,
      email,
      phone,
      linkedIn,
      portfolio,
      resumeFileName,
      coverLetter,
      heardAbout,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      status: 'new'
    };
    
    // Get existing applications and add new entry
    const applications = await getExistingApplications();
    applications.unshift(application); // Add new entry to the beginning for newest-first ordering
    
    // Write updated applications
    await writeApplications(applications);
    
    return NextResponse.json({ success: true, id: application.id });
  } catch (error) {
    console.error('Error handling job application:', error);
    return NextResponse.json(
      { error: 'Failed to process job application' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve applications (protected for admin use)
export async function GET(request: Request) {
  // Check authentication
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.ADMIN_API_KEY;
  
  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const jobId = url.searchParams.get('jobId');
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Get applications
    const applications = await getExistingApplications();
    
    // Apply filters
    let filteredApplications = applications;
    
    // Filter by ID if provided
    if (id) {
      filteredApplications = filteredApplications.filter(app => app.id === id);
    }
    
    // Filter by job ID if provided
    if (jobId) {
      filteredApplications = filteredApplications.filter(app => app.jobId === jobId);
    }
    
    // Filter by status if provided
    if (status) {
      filteredApplications = filteredApplications.filter(app => app.status === status);
    }
    
    // Filter by date range if provided
    if (startDate) {
      const startTimestamp = new Date(startDate).getTime();
      filteredApplications = filteredApplications.filter(app => 
        new Date(app.timestamp).getTime() >= startTimestamp
      );
    }
    
    if (endDate) {
      const endTimestamp = new Date(endDate).getTime();
      filteredApplications = filteredApplications.filter(app => 
        new Date(app.timestamp).getTime() <= endTimestamp
      );
    }
    
    return NextResponse.json({ 
      applications: filteredApplications,
      total: filteredApplications.length
    });
  } catch (error) {
    console.error('Error retrieving job applications:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve job applications' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update application status
export async function PATCH(request: Request) {
  // Check authentication
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.ADMIN_API_KEY;
  
  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const data = await request.json();
    const { id, status } = data;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['new', 'reviewed', 'interviewing', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Get applications
    const applications = await getExistingApplications();
    
    // Find and update application
    const applicationIndex = applications.findIndex(app => app.id === id);
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    applications[applicationIndex].status = status as JobApplication['status'];
    
    // Write updated applications
    await writeApplications(applications);
    
    return NextResponse.json({ 
      success: true, 
      application: applications[applicationIndex]
    });
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json(
      { error: 'Failed to update job application' },
      { status: 500 }
    );
  }
} 