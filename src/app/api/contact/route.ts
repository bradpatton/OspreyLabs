import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the storage file path
const STORAGE_DIR = path.join(process.cwd(), 'logs');
const CONTACT_FORM_FILE = path.join(STORAGE_DIR, 'contact-submissions.json');

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch (error) {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Interface for contact form submission
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  service: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

// Function to get existing submissions
async function getExistingSubmissions(): Promise<ContactSubmission[]> {
  try {
    await ensureStorageDir();
    
    try {
      const data = await fs.readFile(CONTACT_FORM_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File might not exist yet
      return [];
    }
  } catch (error) {
    console.error('Error reading contact submissions:', error);
    return [];
  }
}

// Function to write submissions
async function writeSubmissions(submissions: ContactSubmission[]) {
  try {
    await ensureStorageDir();
    await fs.writeFile(CONTACT_FORM_FILE, JSON.stringify(submissions, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing contact submissions:', error);
  }
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// POST endpoint to add a new submission
export async function POST(request: Request) {
  try {
    console.log('Received contact form submission request');
    const data = await request.json();
    console.log('Form data received:', data);
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      console.log('Validation failed, missing required fields:', { name: !!data.name, email: !!data.email, message: !!data.message });
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Create submission entry
    const submission: ContactSubmission = {
      id: generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      company: data.company || '',
      message: data.message,
      service: data.service || 'Other',
      timestamp: data.timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    };
    
    console.log('Created submission object:', submission);
    
    // Get existing submissions and add new entry
    const submissions = await getExistingSubmissions();
    submissions.unshift(submission); // Add new entry to the beginning for newest-first ordering
    
    // Write updated submissions
    try {
      await writeSubmissions(submissions);
      console.log('Successfully saved submission with ID:', submission.id);
    } catch (writeError) {
      console.error('Failed to write submission to file:', writeError);
      throw writeError;
    }
    
    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error('Error handling contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve submissions (protected for admin use)
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
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Get submissions
    const submissions = await getExistingSubmissions();
    
    // Apply filters
    let filteredSubmissions = submissions;
    
    // Filter by ID if provided
    if (id) {
      filteredSubmissions = filteredSubmissions.filter(submission => submission.id === id);
    }
    
    // Filter by date range if provided
    if (startDate) {
      const startTimestamp = new Date(startDate).getTime();
      filteredSubmissions = filteredSubmissions.filter(submission => 
        new Date(submission.timestamp).getTime() >= startTimestamp
      );
    }
    
    if (endDate) {
      const endTimestamp = new Date(endDate).getTime();
      filteredSubmissions = filteredSubmissions.filter(submission => 
        new Date(submission.timestamp).getTime() <= endTimestamp
      );
    }
    
    return NextResponse.json({ 
      submissions: filteredSubmissions,
      total: filteredSubmissions.length
    });
  } catch (error) {
    console.error('Error retrieving contact submissions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve contact submissions' },
      { status: 500 }
    );
  }
} 