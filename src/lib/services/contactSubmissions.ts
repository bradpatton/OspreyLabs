import { query } from '../database';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  handled_by?: string;
  handled_at?: string;
}

export interface CreateContactSubmissionRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
  ip_address?: string;
  user_agent?: string;
}

export class ContactSubmissionsService {
  // Create new contact submission
  static async createSubmission(
    submissionData: CreateContactSubmissionRequest
  ): Promise<ContactSubmission> {
    const {
      name,
      email,
      company,
      message,
      ip_address,
      user_agent,
    } = submissionData;

    const result = await query<ContactSubmission>(
      `INSERT INTO contact_submissions (name, email, company, message, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, company, message, ip_address, user_agent]
    );

    return result.rows[0];
  }

  // Get all contact submissions
  static async getAllSubmissions(options: {
    status?: 'new' | 'read' | 'replied' | 'archived';
    limit?: number;
    offset?: number;
  } = {}): Promise<ContactSubmission[]> {
    const { status, limit, offset = 0 } = options;
    
    let whereClause = '';
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      whereClause = `WHERE status = $${paramCount++}`;
      params.push(status);
    }

    let limitClause = '';
    if (limit) {
      limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);
    }

    const result = await query<ContactSubmission>(
      `SELECT * FROM contact_submissions 
       ${whereClause}
       ORDER BY created_at DESC
       ${limitClause}`,
      params
    );

    return result.rows;
  }

  // Get submission by ID
  static async getSubmissionById(id: string): Promise<ContactSubmission | null> {
    const result = await query<ContactSubmission>(
      'SELECT * FROM contact_submissions WHERE id = $1',
      [id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Update submission status
  static async updateSubmissionStatus(
    id: string,
    status: 'new' | 'read' | 'replied' | 'archived',
    handledBy?: string
  ): Promise<ContactSubmission | null> {
    const updateFields = ['status = $2'];
    const params: any[] = [id, status];
    let paramCount = 3;

    if (handledBy) {
      updateFields.push(`handled_by = $${paramCount++}`, 'handled_at = CURRENT_TIMESTAMP');
      params.push(handledBy);
    }

    const result = await query<ContactSubmission>(
      `UPDATE contact_submissions 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      params
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete submission
  static async deleteSubmission(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM contact_submissions WHERE id = $1',
      [id]
    );

    return (result.rowCount || 0) > 0;
  }

  // Search submissions
  static async searchSubmissions(
    searchTerm: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ContactSubmission[]> {
    const { limit, offset = 0 } = options;
    
    const params: any[] = [`%${searchTerm}%`];
    let paramCount = 2;
    
    let limitClause = '';
    if (limit) {
      limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);
    }

    const result = await query<ContactSubmission>(
      `SELECT * FROM contact_submissions 
       WHERE name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1 OR message ILIKE $1
       ORDER BY created_at DESC
       ${limitClause}`,
      params
    );

    return result.rows;
  }

  // Get submission statistics
  static async getSubmissionStats(): Promise<{
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    const [statusResult, todayResult, weekResult, monthResult] = await Promise.all([
      query<{ status: string; count: string }>(
        'SELECT status, COUNT(*) as count FROM contact_submissions GROUP BY status'
      ),
      query<{ count: string }>(
        'SELECT COUNT(*) as count FROM contact_submissions WHERE created_at >= CURRENT_DATE'
      ),
      query<{ count: string }>(
        'SELECT COUNT(*) as count FROM contact_submissions WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''
      ),
      query<{ count: string }>(
        'SELECT COUNT(*) as count FROM contact_submissions WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\''
      ),
    ]);

    const stats = {
      total: 0,
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
      today: parseInt(todayResult.rows[0].count),
      thisWeek: parseInt(weekResult.rows[0].count),
      thisMonth: parseInt(monthResult.rows[0].count),
    };

    statusResult.rows.forEach(row => {
      const count = parseInt(row.count);
      stats.total += count;
      
      switch (row.status) {
        case 'new':
          stats.new = count;
          break;
        case 'read':
          stats.read = count;
          break;
        case 'replied':
          stats.replied = count;
          break;
        case 'archived':
          stats.archived = count;
          break;
      }
    });

    return stats;
  }

  // Mark submission as read
  static async markAsRead(id: string, handledBy?: string): Promise<ContactSubmission | null> {
    return this.updateSubmissionStatus(id, 'read', handledBy);
  }

  // Mark submission as replied
  static async markAsReplied(id: string, handledBy?: string): Promise<ContactSubmission | null> {
    return this.updateSubmissionStatus(id, 'replied', handledBy);
  }

  // Archive submission
  static async archiveSubmission(id: string, handledBy?: string): Promise<ContactSubmission | null> {
    return this.updateSubmissionStatus(id, 'archived', handledBy);
  }
}

export default ContactSubmissionsService; 