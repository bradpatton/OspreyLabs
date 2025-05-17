import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the log file path
const LOG_DIR = path.join(process.cwd(), 'logs');
const CHAT_LOG_FILE = path.join(LOG_DIR, 'chat-logs.json');

// Ensure log directory exists
async function ensureLogDir() {
  try {
    await fs.access(LOG_DIR);
  } catch (error) {
    await fs.mkdir(LOG_DIR, { recursive: true });
  }
}

// Interface for chat log entry
interface ChatLogEntry {
  threadId: string;
  timestamp: string;
  userMessage: string;
  assistantResponse: string;
  userAgent?: string;
  ip?: string;
}

// Function to get existing logs
async function getExistingLogs(): Promise<ChatLogEntry[]> {
  try {
    await ensureLogDir();
    
    try {
      const data = await fs.readFile(CHAT_LOG_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File might not exist yet
      return [];
    }
  } catch (error) {
    console.error('Error reading chat logs:', error);
    return [];
  }
}

// Function to write logs
async function writeLogs(logs: ChatLogEntry[]) {
  try {
    await ensureLogDir();
    await fs.writeFile(CHAT_LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing chat logs:', error);
  }
}

// Function to group logs by thread ID
function groupLogsByThread(logs: ChatLogEntry[]) {
  const threadMap: Record<string, ChatLogEntry[]> = {};
  
  // Group messages by threadId
  logs.forEach(log => {
    if (!threadMap[log.threadId]) {
      threadMap[log.threadId] = [];
    }
    threadMap[log.threadId].push(log);
  });
  
  // Sort messages within each thread by timestamp
  Object.keys(threadMap).forEach(threadId => {
    threadMap[threadId].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });
  
  return threadMap;
}

// Verify authentication
function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.ADMIN_API_KEY;
  
  return !!apiKey && authHeader === `Bearer ${apiKey}`;
}

// POST endpoint to add a new log entry
export async function POST(request: Request) {
  try {
    const { threadId, userMessage, assistantResponse } = await request.json();
    
    if (!threadId || !userMessage || !assistantResponse) {
      return NextResponse.json(
        { error: 'threadId, userMessage, and assistantResponse are required' },
        { status: 400 }
      );
    }
    
    // Create log entry
    const logEntry: ChatLogEntry = {
      threadId,
      timestamp: new Date().toISOString(),
      userMessage,
      assistantResponse,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    };
    
    // Get existing logs and add new entry
    const logs = await getExistingLogs();
    logs.unshift(logEntry); // Add new entry to the beginning for newest-first ordering
    
    // Write updated logs
    await writeLogs(logs);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging chat:', error);
    return NextResponse.json(
      { error: 'Failed to log chat' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve logs (protected for admin use)
export async function GET(request: Request) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const url = new URL(request.url);
    const threadId = url.searchParams.get('threadId');
    const format = url.searchParams.get('format') || 'raw'; // 'raw' or 'grouped'
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Get logs
    const logs = await getExistingLogs();
    
    // Apply filters
    let filteredLogs = logs;
    
    // Filter by thread ID if provided
    if (threadId) {
      filteredLogs = filteredLogs.filter(log => log.threadId === threadId);
    }
    
    // Filter by date range if provided
    if (startDate) {
      const startTimestamp = new Date(startDate).getTime();
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp).getTime() >= startTimestamp
      );
    }
    
    if (endDate) {
      const endTimestamp = new Date(endDate).getTime();
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp).getTime() <= endTimestamp
      );
    }
    
    // Return data in requested format
    if (format === 'grouped') {
      return NextResponse.json({ 
        threads: groupLogsByThread(filteredLogs),
        total: Object.keys(groupLogsByThread(filteredLogs)).length
      });
    }
    
    // Default raw format
    return NextResponse.json({ 
      logs: filteredLogs,
      total: filteredLogs.length
    });
  } catch (error) {
    console.error('Error retrieving chat logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat logs' },
      { status: 500 }
    );
  }
} 