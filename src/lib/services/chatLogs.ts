import { query } from '../database';

export interface ChatLogEntry {
  id: string;
  thread_id: string;
  user_message: string;
  assistant_response: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ChatThread {
  threadId: string;
  messages: ChatLogEntry[];
  firstTimestamp: string;
  lastTimestamp: string;
  userAgent?: string;
}

export class ChatLogsService {
  // Create new chat log entry
  static async createChatLog(
    threadId: string,
    userMessage: string,
    assistantResponse: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ChatLogEntry> {
    const result = await query<ChatLogEntry>(
      `INSERT INTO chat_logs (thread_id, user_message, assistant_response, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [threadId, userMessage, assistantResponse, ipAddress, userAgent]
    );

    return result.rows[0];
  }

  // Get all chat logs
  static async getAllChatLogs(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<ChatLogEntry[]> {
    const { limit, offset = 0 } = options;
    
    let limitClause = '';
    const params: any[] = [];
    
    if (limit) {
      limitClause = 'LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query<ChatLogEntry>(
      `SELECT * FROM chat_logs 
       ORDER BY created_at DESC
       ${limitClause}`,
      params
    );

    return result.rows;
  }

  // Get chat logs by thread ID
  static async getChatLogsByThread(threadId: string): Promise<ChatLogEntry[]> {
    const result = await query<ChatLogEntry>(
      'SELECT * FROM chat_logs WHERE thread_id = $1 ORDER BY created_at ASC',
      [threadId]
    );

    return result.rows;
  }

  // Get chat logs grouped by thread
  static async getChatThreads(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<ChatThread[]> {
    const { limit, offset = 0 } = options;
    
    // Get all logs first
    const logs = await this.getAllChatLogs({ limit: limit ? limit * 10 : undefined, offset });
    
    // Group by thread ID
    const threadMap: Record<string, ChatLogEntry[]> = {};
    
    logs.forEach(log => {
      if (!threadMap[log.thread_id]) {
        threadMap[log.thread_id] = [];
      }
      threadMap[log.thread_id].push(log);
    });
    
    // Create thread objects
    const threads: ChatThread[] = Object.entries(threadMap).map(([threadId, messages]) => {
      // Sort messages by timestamp (oldest first for conversation flow)
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      return {
        threadId,
        messages: sortedMessages,
        firstTimestamp: sortedMessages[0].created_at,
        lastTimestamp: sortedMessages[sortedMessages.length - 1].created_at,
        userAgent: sortedMessages[0].user_agent
      };
    });
    
    // Sort threads by most recent activity first
    threads.sort(
      (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
    
    // Apply limit to threads if specified
    if (limit) {
      return threads.slice(0, limit);
    }
    
    return threads;
  }

  // Delete chat logs older than specified days
  static async deleteOldChatLogs(daysOld: number): Promise<number> {
    const result = await query(
      'DELETE FROM chat_logs WHERE created_at < NOW() - INTERVAL $1 DAY',
      [daysOld]
    );

    return result.rowCount || 0;
  }

  // Get chat log statistics
  static async getChatLogStats(): Promise<{
    totalLogs: number;
    totalThreads: number;
    logsToday: number;
    logsThisWeek: number;
    logsThisMonth: number;
  }> {
    const [totalResult, threadsResult, todayResult, weekResult, monthResult] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) as count FROM chat_logs'),
      query<{ count: string }>('SELECT COUNT(DISTINCT thread_id) as count FROM chat_logs'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM chat_logs WHERE created_at >= CURRENT_DATE'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM chat_logs WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''),
      query<{ count: string }>('SELECT COUNT(*) as count FROM chat_logs WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\''),
    ]);

    return {
      totalLogs: parseInt(totalResult.rows[0].count),
      totalThreads: parseInt(threadsResult.rows[0].count),
      logsToday: parseInt(todayResult.rows[0].count),
      logsThisWeek: parseInt(weekResult.rows[0].count),
      logsThisMonth: parseInt(monthResult.rows[0].count),
    };
  }

  // Search chat logs
  static async searchChatLogs(
    searchTerm: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ChatLogEntry[]> {
    const { limit, offset = 0 } = options;
    
    const params: any[] = [`%${searchTerm}%`];
    let paramCount = 2;
    
    let limitClause = '';
    if (limit) {
      limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);
    }

    const result = await query<ChatLogEntry>(
      `SELECT * FROM chat_logs 
       WHERE user_message ILIKE $1 OR assistant_response ILIKE $1
       ORDER BY created_at DESC
       ${limitClause}`,
      params
    );

    return result.rows;
  }
}

export default ChatLogsService; 