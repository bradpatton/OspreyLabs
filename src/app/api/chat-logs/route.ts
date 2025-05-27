import { NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import ChatLogsService from '@/lib/services/chatLogs';

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

// GET - Fetch chat logs (admin only)
export async function GET(request: Request) {
  try {
    const { isValid } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const search = searchParams.get('search');
    const grouped = searchParams.get('grouped') === 'true';

    if (threadId) {
      // Get logs for specific thread
      const logs = await ChatLogsService.getChatLogsByThread(threadId);
      return NextResponse.json(logs);
    }

    if (grouped) {
      // Get logs grouped by thread
      const threads = await ChatLogsService.getChatThreads({ limit, offset });
      return NextResponse.json(threads);
    }

    let logs;

    if (search) {
      logs = await ChatLogsService.searchChatLogs(search, {
        limit,
        offset,
      });
    } else {
      logs = await ChatLogsService.getAllChatLogs({
        limit,
        offset,
      });
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    return NextResponse.json({ error: 'Failed to fetch chat logs' }, { status: 500 });
  }
}

// POST - Create new chat log entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { threadId, userMessage, assistantResponse } = body;
    
    // Validate required fields
    if (!threadId || !userMessage || !assistantResponse) {
      return NextResponse.json(
        { error: 'Thread ID, user message, and assistant response are required' },
        { status: 400 }
      );
    }

    // Get client information
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const chatLog = await ChatLogsService.createChatLog(
      threadId,
      userMessage,
      assistantResponse,
      ipAddress,
      userAgent
    );
    
    return NextResponse.json(chatLog, { status: 201 });
  } catch (error) {
    console.error('Error creating chat log:', error);
    return NextResponse.json({ error: 'Failed to create chat log' }, { status: 500 });
  }
}

// DELETE - Delete old chat logs (admin only)
export async function DELETE(request: Request) {
  try {
    const { isValid } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const daysOld = searchParams.get('daysOld');
    
    if (!daysOld) {
      return NextResponse.json({ error: 'daysOld parameter is required' }, { status: 400 });
    }

    const deletedCount = await ChatLogsService.deleteOldChatLogs(parseInt(daysOld));
    
    return NextResponse.json({ 
      message: `Deleted ${deletedCount} chat logs older than ${daysOld} days`,
      deletedCount 
    });
  } catch (error) {
    console.error('Error deleting old chat logs:', error);
    return NextResponse.json({ error: 'Failed to delete chat logs' }, { status: 500 });
  }
} 