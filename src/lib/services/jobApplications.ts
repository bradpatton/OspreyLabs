import { query } from '../database';

export interface JobApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  experience_level?: string;
  resume_url?: string;
  cover_letter?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired';
  notes?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface CreateJobApplicationRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  experience_level?: string;
  resume_url?: string;
  cover_letter?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  ip_address?: string;
  user_agent?: string;
}

export class JobApplicationsService {
  // Create new job application
  static async createApplication(
    applicationData: CreateJobApplicationRequest
  ): Promise<JobApplication> {
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
      ip_address,
      user_agent,
    } = applicationData;

    const result = await query<JobApplication>(
      `INSERT INTO job_applications (
        first_name, last_name, email, phone, position, experience_level,
        resume_url, cover_letter, linkedin_url, portfolio_url, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
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
        ip_address,
        user_agent,
      ]
    );

    return result.rows[0];
  }

  // Get all job applications
  static async getAllApplications(options: {
    status?: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired';
    position?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<JobApplication[]> {
    const { status, position, limit, offset = 0 } = options;
    
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (position) {
      whereConditions.push(`position ILIKE $${paramCount++}`);
      params.push(`%${position}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let limitClause = '';
    if (limit) {
      limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);
    }

    const result = await query<JobApplication>(
      `SELECT * FROM job_applications 
       ${whereClause}
       ORDER BY created_at DESC
       ${limitClause}`,
      params
    );

    return result.rows;
  }

  // Get application by ID
  static async getApplicationById(id: string): Promise<JobApplication | null> {
    const result = await query<JobApplication>(
      'SELECT * FROM job_applications WHERE id = $1',
      [id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Update application status
  static async updateApplicationStatus(
    id: string,
    status: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired',
    reviewedBy?: string,
    notes?: string
  ): Promise<JobApplication | null> {
    const updateFields = ['status = $2'];
    const params: any[] = [id, status];
    let paramCount = 3;

    if (reviewedBy) {
      updateFields.push(`reviewed_by = $${paramCount++}`, 'reviewed_at = CURRENT_TIMESTAMP');
      params.push(reviewedBy);
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount++}`);
      params.push(notes);
    }

    const result = await query<JobApplication>(
      `UPDATE job_applications 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      params
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Update application notes
  static async updateApplicationNotes(
    id: string,
    notes: string,
    reviewedBy?: string
  ): Promise<JobApplication | null> {
    const updateFields = ['notes = $2'];
    const params: any[] = [id, notes];
    let paramCount = 3;

    if (reviewedBy) {
      updateFields.push(`reviewed_by = $${paramCount++}`, 'reviewed_at = CURRENT_TIMESTAMP');
      params.push(reviewedBy);
    }

    const result = await query<JobApplication>(
      `UPDATE job_applications 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      params
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete application
  static async deleteApplication(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM job_applications WHERE id = $1',
      [id]
    );

    return (result.rowCount || 0) > 0;
  }

  // Search applications
  static async searchApplications(
    searchTerm: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<JobApplication[]> {
    const { limit, offset = 0 } = options;
    
    const params: any[] = [`%${searchTerm}%`];
    let paramCount = 2;
    
    let limitClause = '';
    if (limit) {
      limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);
    }

    const result = await query<JobApplication>(
      `SELECT * FROM job_applications 
       WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 
             OR position ILIKE $1 OR cover_letter ILIKE $1 OR notes ILIKE $1
       ORDER BY created_at DESC
       ${limitClause}`,
      params
    );

    return result.rows;
  }

  // Get application statistics
  static async getApplicationStats(): Promise<{
    total: number;
    new: number;
    reviewing: number;
    interview: number;
    rejected: number;
    hired: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byPosition: { position: string; count: number }[];
  }> {
    const [statusResult, todayResult, weekResult, monthResult, positionResult] = await Promise.all([
      query<{ status: string; count: string }>(
        'SELECT status, COUNT(*) as count FROM job_applications GROUP BY status'
      ),
      query<{ count: string }>(
        'SELECT COUNT(*) as count FROM job_applications WHERE created_at >= CURRENT_DATE'
      ),
      query<{ count: string }>(
        'SELECT COUNT(*) as count FROM job_applications WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''
      ),
      query<{ count: string }>(
        'SELECT COUNT(*) as count FROM job_applications WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\''
      ),
      query<{ position: string; count: string }>(
        'SELECT position, COUNT(*) as count FROM job_applications GROUP BY position ORDER BY count DESC LIMIT 10'
      ),
    ]);

    const stats = {
      total: 0,
      new: 0,
      reviewing: 0,
      interview: 0,
      rejected: 0,
      hired: 0,
      today: parseInt(todayResult.rows[0].count),
      thisWeek: parseInt(weekResult.rows[0].count),
      thisMonth: parseInt(monthResult.rows[0].count),
      byPosition: positionResult.rows.map(row => ({
        position: row.position,
        count: parseInt(row.count),
      })),
    };

    statusResult.rows.forEach(row => {
      const count = parseInt(row.count);
      stats.total += count;
      
      switch (row.status) {
        case 'new':
          stats.new = count;
          break;
        case 'reviewing':
          stats.reviewing = count;
          break;
        case 'interview':
          stats.interview = count;
          break;
        case 'rejected':
          stats.rejected = count;
          break;
        case 'hired':
          stats.hired = count;
          break;
      }
    });

    return stats;
  }

  // Get unique positions
  static async getUniquePositions(): Promise<string[]> {
    const result = await query<{ position: string }>(
      'SELECT DISTINCT position FROM job_applications ORDER BY position'
    );

    return result.rows.map(row => row.position);
  }

  // Mark application as reviewing
  static async markAsReviewing(id: string, reviewedBy?: string): Promise<JobApplication | null> {
    return this.updateApplicationStatus(id, 'reviewing', reviewedBy);
  }

  // Schedule interview
  static async scheduleInterview(id: string, reviewedBy?: string, notes?: string): Promise<JobApplication | null> {
    return this.updateApplicationStatus(id, 'interview', reviewedBy, notes);
  }

  // Reject application
  static async rejectApplication(id: string, reviewedBy?: string, notes?: string): Promise<JobApplication | null> {
    return this.updateApplicationStatus(id, 'rejected', reviewedBy, notes);
  }

  // Hire applicant
  static async hireApplicant(id: string, reviewedBy?: string, notes?: string): Promise<JobApplication | null> {
    return this.updateApplicationStatus(id, 'hired', reviewedBy, notes);
  }
}

export default JobApplicationsService; 