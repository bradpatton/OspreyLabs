import { NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import ArticlesService from '@/lib/services/articles';
import ContactSubmissionsService from '@/lib/services/contactSubmissions';
import JobApplicationsService from '@/lib/services/jobApplications';
import ChatLogsService from '@/lib/services/chatLogs';

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

// GET - Fetch admin dashboard statistics
export async function GET(request: Request) {
  try {
    const { isValid } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all statistics in parallel
    const [
      articleStats,
      contactStats,
      jobStats,
      chatStats,
    ] = await Promise.all([
      ArticlesService.getArticleStats(),
      ContactSubmissionsService.getSubmissionStats(),
      JobApplicationsService.getApplicationStats(),
      ChatLogsService.getChatLogStats(),
    ]);

    // Combine all statistics
    const dashboardStats = {
      articles: articleStats,
      contacts: contactStats,
      jobs: jobStats,
      chats: chatStats,
      overview: {
        totalArticles: articleStats.total,
        totalContacts: contactStats.total,
        totalJobs: jobStats.total,
        totalChats: chatStats.totalLogs,
        newContactsToday: contactStats.today,
        newJobsToday: jobStats.today,
        chatsToday: chatStats.logsToday,
        publishedArticles: articleStats.published,
      },
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
} 