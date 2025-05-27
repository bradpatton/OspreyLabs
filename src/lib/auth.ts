import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from './database';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AdminUserWithApiKey extends AdminUser {
  api_key: string;
}

export interface AdminSession {
  id: string;
  user_id: string;
  session_token: string;
  api_key: string;
  expires_at: string;
  created_at: string;
  last_accessed: string;
  ip_address?: string;
  user_agent?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'super_admin';
}

// Authentication service class
export class AuthService {
  // Hash password using bcrypt
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password against hash
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate secure API key
  static generateApiKey(): string {
    return `osprey-${uuidv4()}-${Date.now()}`;
  }

  // Generate session token
  static generateSessionToken(): string {
    return uuidv4();
  }

  // Create new admin user
  static async createUser(userData: CreateUserData): Promise<AdminUser> {
    const { username, email, password, role = 'admin' } = userData;
    
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM admin_users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this username or email already exists');
    }

    // Hash password and generate API key
    const passwordHash = await this.hashPassword(password);
    const apiKey = this.generateApiKey();

    // Insert new user
    const result = await query<AdminUser>(
      `INSERT INTO admin_users (username, email, password_hash, api_key, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, role, is_active, created_at, updated_at`,
      [username, email, passwordHash, apiKey, role]
    );

    return result.rows[0];
  }

  // Authenticate user with username/password
  static async authenticateUser(credentials: LoginCredentials): Promise<AdminUserWithApiKey | null> {
    const { username, password } = credentials;

    // Get user by username
    const result = await query<AdminUserWithApiKey & { password_hash: string }>(
      'SELECT * FROM admin_users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Validate API key
  static async validateApiKey(apiKey: string): Promise<AdminUser | null> {
    if (!apiKey) {
      return null;
    }

    const result = await query<AdminUser>(
      'SELECT id, username, email, role, is_active, created_at, updated_at, last_login FROM admin_users WHERE api_key = $1 AND is_active = true',
      [apiKey]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Get user with API key by ID
  static async getUserWithApiKey(userId: string): Promise<AdminUserWithApiKey | null> {
    const result = await query<AdminUserWithApiKey>(
      'SELECT id, username, email, role, is_active, created_at, updated_at, last_login, api_key FROM admin_users WHERE id = $1',
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create session for user
  static async createSession(
    userId: string, 
    apiKey: string, 
    expiresInHours: number = 24,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AdminSession> {
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const result = await query<AdminSession>(
      `INSERT INTO admin_sessions (user_id, session_token, api_key, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, sessionToken, apiKey, expiresAt, ipAddress, userAgent]
    );

    return result.rows[0];
  }

  // Validate session token
  static async validateSession(sessionToken: string): Promise<{ user: AdminUser; session: AdminSession } | null> {
    const result = await query<AdminSession & AdminUser>(
      `SELECT 
         s.*,
         u.id as user_id,
         u.username,
         u.email,
         u.role,
         u.is_active,
         u.created_at as user_created_at,
         u.updated_at as user_updated_at,
         u.last_login
       FROM admin_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = true`,
      [sessionToken]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Update last accessed time
    await query(
      'UPDATE admin_sessions SET last_accessed = CURRENT_TIMESTAMP WHERE id = $1',
      [row.id]
    );

    // Separate user and session data
    const user: AdminUser = {
      id: row.user_id,
      username: row.username,
      email: row.email,
      role: row.role,
      is_active: row.is_active,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
      last_login: row.last_login,
    };

    const session: AdminSession = {
      id: row.id,
      user_id: row.user_id,
      session_token: row.session_token,
      api_key: row.api_key,
      expires_at: row.expires_at,
      created_at: row.created_at,
      last_accessed: row.last_accessed,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
    };

    return { user, session };
  }

  // Invalidate session
  static async invalidateSession(sessionToken: string): Promise<void> {
    await query(
      'DELETE FROM admin_sessions WHERE session_token = $1',
      [sessionToken]
    );
  }

  // Invalidate all sessions for a user
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    await query(
      'DELETE FROM admin_sessions WHERE user_id = $1',
      [userId]
    );
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await query(
      'DELETE FROM admin_sessions WHERE expires_at < CURRENT_TIMESTAMP'
    );
    return result.rowCount || 0;
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AdminUser | null> {
    const result = await query<AdminUser>(
      'SELECT id, username, email, role, is_active, created_at, updated_at, last_login FROM admin_users WHERE id = $1',
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<CreateUserData>): Promise<AdminUser | null> {
    const { username, email, password, role } = updates;
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (username) {
      updateFields.push(`username = $${paramCount++}`);
      values.push(username);
    }

    if (email) {
      updateFields.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (password) {
      const passwordHash = await this.hashPassword(password);
      updateFields.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }

    if (role) {
      updateFields.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (updateFields.length === 0) {
      return this.getUserById(userId);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query<AdminUser>(
      `UPDATE admin_users SET ${updateFields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, username, email, role, is_active, created_at, updated_at, last_login`,
      values
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Deactivate user
  static async deactivateUser(userId: string): Promise<void> {
    await transaction(async (client) => {
      // Deactivate user
      await client.query(
        'UPDATE admin_users SET is_active = false WHERE id = $1',
        [userId]
      );

      // Invalidate all sessions
      await client.query(
        'DELETE FROM admin_sessions WHERE user_id = $1',
        [userId]
      );
    });
  }

  // Get all active sessions for a user
  static async getUserSessions(userId: string): Promise<AdminSession[]> {
    const result = await query<AdminSession>(
      'SELECT * FROM admin_sessions WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP ORDER BY last_accessed DESC',
      [userId]
    );

    return result.rows;
  }
}

export default AuthService; 