import { query, transaction } from '../database';
import { Article, CreateArticleRequest } from '@/types/article';

export interface DatabaseArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  featured_image?: string;
  read_time: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export class ArticlesService {
  // Convert database article to API article format
  private static formatArticle(dbArticle: DatabaseArticle): Article {
    return {
      id: dbArticle.id,
      title: dbArticle.title,
      slug: dbArticle.slug,
      excerpt: dbArticle.excerpt || '',
      content: dbArticle.content,
      author: dbArticle.author,
      status: dbArticle.status,
      tags: dbArticle.tags || [],
      featuredImage: dbArticle.featured_image,
      readTime: dbArticle.read_time,
      publishedAt: dbArticle.published_at || dbArticle.created_at,
      createdAt: dbArticle.created_at,
      updatedAt: dbArticle.updated_at,
    };
  }

  // Generate slug from title
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Calculate estimated read time (words per minute)
  private static calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Get all articles with optional filtering
  static async getArticles(options: {
    status?: 'draft' | 'published' | 'archived';
    limit?: number;
    offset?: number;
    includeUnpublished?: boolean;
  } = {}): Promise<Article[]> {
    const { status, limit, offset = 0, includeUnpublished = false } = options;
    
    let whereClause = '';
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      whereClause = `WHERE status = $${paramCount++}`;
      params.push(status);
    } else if (!includeUnpublished) {
      whereClause = `WHERE status = 'published'`;
    }

    let limitClause = '';
    if (limit) {
      limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);
    }

    const result = await query<DatabaseArticle>(
      `SELECT * FROM articles 
       ${whereClause}
       ORDER BY 
         CASE WHEN status = 'published' THEN published_at ELSE created_at END DESC
       ${limitClause}`,
      params
    );

    return result.rows.map(this.formatArticle);
  }

  // Get article by ID
  static async getArticleById(id: string): Promise<Article | null> {
    const result = await query<DatabaseArticle>(
      'SELECT * FROM articles WHERE id = $1',
      [id]
    );

    return result.rows.length > 0 ? this.formatArticle(result.rows[0]) : null;
  }

  // Get article by slug
  static async getArticleBySlug(slug: string): Promise<Article | null> {
    const result = await query<DatabaseArticle>(
      'SELECT * FROM articles WHERE slug = $1',
      [slug]
    );

    return result.rows.length > 0 ? this.formatArticle(result.rows[0]) : null;
  }

  // Create new article
  static async createArticle(
    articleData: CreateArticleRequest,
    createdBy?: string
  ): Promise<Article> {
    const {
      title,
      excerpt,
      content,
      author,
      status = 'draft',
      tags = [],
      featuredImage,
    } = articleData;

    // Generate slug and calculate read time
    const slug = this.generateSlug(title);
    const readTime = this.calculateReadTime(content);

    // Check if slug already exists
    const existingArticle = await this.getArticleBySlug(slug);
    if (existingArticle) {
      throw new Error(`Article with slug "${slug}" already exists`);
    }

    // Set published_at if status is published
    const publishedAt = status === 'published' ? new Date() : null;

    const result = await query<DatabaseArticle>(
      `INSERT INTO articles (
        title, slug, excerpt, content, author, status, tags, 
        featured_image, read_time, published_at, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        title,
        slug,
        excerpt,
        content,
        author,
        status,
        tags,
        featuredImage,
        readTime,
        publishedAt,
        createdBy,
        createdBy,
      ]
    );

    return this.formatArticle(result.rows[0]);
  }

  // Update article
  static async updateArticle(
    id: string,
    updates: Partial<CreateArticleRequest> & { id?: string },
    updatedBy?: string
  ): Promise<Article | null> {
    const existingArticle = await this.getArticleById(id);
    if (!existingArticle) {
      return null;
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Handle title and slug update
    if (updates.title && updates.title !== existingArticle.title) {
      const newSlug = this.generateSlug(updates.title);
      
      // Check if new slug conflicts with existing articles (excluding current)
      const conflictingArticle = await query(
        'SELECT id FROM articles WHERE slug = $1 AND id != $2',
        [newSlug, id]
      );

      if (conflictingArticle.rows.length > 0) {
        throw new Error(`Article with slug "${newSlug}" already exists`);
      }

      updateFields.push(`title = $${paramCount++}`, `slug = $${paramCount++}`);
      values.push(updates.title, newSlug);
    }

    // Handle other fields
    if (updates.excerpt !== undefined) {
      updateFields.push(`excerpt = $${paramCount++}`);
      values.push(updates.excerpt);
    }

    if (updates.content !== undefined) {
      updateFields.push(`content = $${paramCount++}`, `read_time = $${paramCount++}`);
      values.push(updates.content, this.calculateReadTime(updates.content));
    }

    if (updates.author !== undefined) {
      updateFields.push(`author = $${paramCount++}`);
      values.push(updates.author);
    }

    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(updates.status);

      // Set published_at when changing to published
      if (updates.status === 'published' && existingArticle.status !== 'published') {
        updateFields.push(`published_at = CURRENT_TIMESTAMP`);
      }
    }

    if (updates.tags !== undefined) {
      updateFields.push(`tags = $${paramCount++}`);
      values.push(updates.tags);
    }

    if (updates.featuredImage !== undefined) {
      updateFields.push(`featured_image = $${paramCount++}`);
      values.push(updates.featuredImage);
    }

    if (updatedBy) {
      updateFields.push(`updated_by = $${paramCount++}`);
      values.push(updatedBy);
    }

    if (updateFields.length === 0) {
      return existingArticle;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query<DatabaseArticle>(
      `UPDATE articles SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    return result.rows.length > 0 ? this.formatArticle(result.rows[0]) : null;
  }

  // Delete article
  static async deleteArticle(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM articles WHERE id = $1',
      [id]
    );

    return (result.rowCount || 0) > 0;
  }

  // Get articles by tag
  static async getArticlesByTag(tag: string, limit?: number): Promise<Article[]> {
    const params: any[] = [tag];
    let limitClause = '';

    if (limit) {
      limitClause = 'LIMIT $2';
      params.push(limit);
    }

    const result = await query<DatabaseArticle>(
      `SELECT * FROM articles 
       WHERE $1 = ANY(tags) AND status = 'published'
       ORDER BY published_at DESC
       ${limitClause}`,
      params
    );

    return result.rows.map(this.formatArticle);
  }

  // Search articles
  static async searchArticles(
    searchTerm: string,
    options: {
      includeUnpublished?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Article[]> {
    const { includeUnpublished = false, limit, offset = 0 } = options;
    
    let whereClause = `WHERE (
      title ILIKE $1 OR 
      excerpt ILIKE $1 OR 
      content ILIKE $1 OR 
      author ILIKE $1 OR
      array_to_string(tags, ' ') ILIKE $1
    )`;

    if (!includeUnpublished) {
      whereClause += ` AND status = 'published'`;
    }

    const params: any[] = [`%${searchTerm}%`];
    let paramCount = 2;

    let limitClause = '';
    if (limit) {
      limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);
    }

    const result = await query<DatabaseArticle>(
      `SELECT * FROM articles 
       ${whereClause}
       ORDER BY 
         CASE WHEN status = 'published' THEN published_at ELSE created_at END DESC
       ${limitClause}`,
      params
    );

    return result.rows.map(this.formatArticle);
  }

  // Get article statistics
  static async getArticleStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
  }> {
    const result = await query<{
      status: string;
      count: string;
    }>(
      `SELECT status, COUNT(*) as count 
       FROM articles 
       GROUP BY status`
    );

    const stats = {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
    };

    result.rows.forEach(row => {
      const count = parseInt(row.count);
      stats.total += count;
      
      switch (row.status) {
        case 'published':
          stats.published = count;
          break;
        case 'draft':
          stats.draft = count;
          break;
        case 'archived':
          stats.archived = count;
          break;
      }
    });

    return stats;
  }

  // Get all unique tags
  static async getAllTags(): Promise<string[]> {
    const result = await query<{ tag: string }>(
      `SELECT DISTINCT unnest(tags) as tag 
       FROM articles 
       WHERE status = 'published' AND tags IS NOT NULL
       ORDER BY tag`
    );

    return result.rows.map(row => row.tag);
  }
}

export default ArticlesService; 