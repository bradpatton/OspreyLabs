import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the storage file paths
const STORAGE_DIR = path.join(process.cwd(), 'logs');
const JOB_APPLICATIONS_FILE = path.join(STORAGE_DIR, 'job-applications.json');
const RESUME_DIR = path.join(STORAGE_DIR, 'resumes');

// Ensure storage directories exist
async function ensureStorageDirs() {
  try {
    await fs.access(STORAGE_DIR);
  } catch (error) {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
  
  try {
    await fs.access(RESUME_DIR);
  } catch (error) {
    await fs.mkdir(RESUME_DIR, { recursive: true });
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
  resumeFilePath: string;
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
    await ensureStorageDirs();
    
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
    await ensureStorageDirs();
    await fs.writeFile(JOB_APPLICATIONS_FILE, JSON.stringify(applications, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing job applications:', error);
    throw new Error('Failed to save application data');
  }
}

// Function to save resume file
async function saveResumeFile(file: Buffer, fileName: string, applicationId: string): Promise<string> {
  try {
    await ensureStorageDirs();
    
    // Create a unique filename with application ID to prevent collisions
    const fileExtension = path.extname(fileName);
    const safeFileName = `${applicationId}_${Date.now()}${fileExtension}`;
    const filePath = path.join(RESUME_DIR, safeFileName);
    
    // Write file to disk
    await fs.writeFile(filePath, file);
    
    return safeFileName;
  } catch (error) {
    console.error('Error saving resume file:', error);
    throw new Error('Failed to save resume file');
  }
}

// Function to get resume file
async function getResumeFile(fileName: string): Promise<Buffer | null> {
  try {
    const filePath = path.join(RESUME_DIR, fileName);
    return await fs.readFile(filePath);
  } catch (error) {
    console.error(`Error reading resume file ${fileName}:`, error);
    return null;
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
    console.log('Received career application submission');
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
      console.log('Missing required fields:', { firstName, lastName, email, hasResume: !!resumeFile });
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }
    
    // Generate application ID
    const applicationId = generateId();
    
    // Get resume file data
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const resumeFileName = resumeFile.name;
    
    // Save resume file to storage
    const savedFileName = await saveResumeFile(resumeBuffer, resumeFileName, applicationId);
    
    // Create application entry
    const application: JobApplication = {
      id: applicationId,
      jobId,
      jobTitle,
      firstName,
      lastName,
      email,
      phone,
      linkedIn,
      portfolio,
      resumeFileName: resumeFileName, // Original filename
      resumeFilePath: savedFileName,   // Saved filename
      coverLetter,
      heardAbout,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      status: 'new'
    };
    
    console.log(`Application created with ID: ${applicationId}`);
    
    // Get existing applications and add new entry
    const applications = await getExistingApplications();
    applications.unshift(application); // Add new entry to the beginning for newest-first ordering
    
    // Write updated applications
    await writeApplications(applications);
    
    console.log('Successfully saved application data');
    
    return NextResponse.json({ 
      success: true, 
      id: application.id,
      message: "Application submitted successfully"
    });
  } catch (error) {
    console.error('Error handling job application:', error);
    return NextResponse.json(
      { error: 'Failed to process job application', message: error instanceof Error ? error.message : 'Unknown error' },
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
    const includeResume = url.searchParams.get('includeResume') === 'true';
    const format = url.searchParams.get('format') || 'json';
    
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
    
    // Include resume files if requested
    if (includeResume && id) {
      // Only include resume for single application
      if (filteredApplications.length === 1) {
        const app = filteredApplications[0];
        const resumeData = await getResumeFile(app.resumeFilePath);
        
        if (resumeData) {
          // If format is 'download', return the file directly
          if (format === 'download') {
            return new Response(resumeData, {
              headers: {
                'Content-Type': getContentType(app.resumeFileName),
                'Content-Disposition': `attachment; filename="${app.resumeFileName}"`,
              },
            });
          }
          
          // For JSON format, encode the file as base64
          return NextResponse.json({
            application: app,
            resumeData: resumeData.toString('base64'),
            resumeFileName: app.resumeFileName
          });
        }
      }
    }
    
    // Return applications in the requested format
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

// Determine content type based on file extension
function getContentType(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return 'application/pdf';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
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