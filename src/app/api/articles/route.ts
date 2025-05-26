import { NextResponse } from 'next/server';
import { Article, CreateArticleRequest } from '@/types/article';
import fs from 'fs';
import path from 'path';

// Simple file-based storage for articles (in production, use a database)
const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(ARTICLES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Helper functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Load articles from file
function loadArticles(): Article[] {
  ensureDataDirectory();
  try {
    if (fs.existsSync(ARTICLES_FILE)) {
      const data = fs.readFileSync(ARTICLES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading articles:', error);
  }
  return [];
}

// Save articles to file
function saveArticles(articles: Article[]): void {
  ensureDataDirectory();
  try {
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
  } catch (error) {
    console.error('Error saving articles:', error);
    throw new Error('Failed to save articles');
  }
}

// Verify admin API key
function verifyAdminKey(request: Request): boolean {
  const adminKey = request.headers.get('x-admin-key');
  return adminKey === process.env.ADMIN_API_KEY;
}

// GET - Fetch all articles or a specific article
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const status = searchParams.get('status');
    
    const articles = loadArticles();
    
    if (id) {
      const article = articles.find(a => a.id === id);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json(article);
    }
    
    if (slug) {
      const article = articles.find(a => a.slug === slug);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json(article);
    }
    
    // Filter by status if provided
    let filteredArticles = articles;
    if (status) {
      filteredArticles = articles.filter(a => a.status === status);
    }
    
    // Sort by publishedAt date (newest first)
    filteredArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    return NextResponse.json(filteredArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

// POST - Create a new article
export async function POST(request: Request) {
  try {
    // Verify admin access
    if (!verifyAdminKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body: CreateArticleRequest = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.author) {
      return NextResponse.json(
        { error: 'Title, content, and author are required' },
        { status: 400 }
      );
    }
    
    const articles = loadArticles();
    const now = new Date().toISOString();
    
    // Generate slug and ensure it's unique
    let slug = generateSlug(body.title);
    let counter = 1;
    while (articles.some(a => a.slug === slug)) {
      slug = `${generateSlug(body.title)}-${counter}`;
      counter++;
    }
    
    const newArticle: Article = {
      id: generateId(),
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content: body.content,
      author: body.author,
      publishedAt: now,
      updatedAt: now,
      status: body.status || 'draft',
      tags: body.tags || [],
      featuredImage: body.featuredImage,
      readTime: calculateReadTime(body.content),
    };
    
    articles.push(newArticle);
    saveArticles(articles);
    
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}

// PUT - Update an existing article
export async function PUT(request: Request) {
  try {
    // Verify admin access
    if (!verifyAdminKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }
    
    const articles = loadArticles();
    const articleIndex = articles.findIndex(a => a.id === id);
    
    if (articleIndex === -1) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const existingArticle = articles[articleIndex];
    
    // Update slug if title changed
    let slug = existingArticle.slug;
    if (updateData.title && updateData.title !== existingArticle.title) {
      slug = generateSlug(updateData.title);
      let counter = 1;
      while (articles.some((a, index) => a.slug === slug && index !== articleIndex)) {
        slug = `${generateSlug(updateData.title)}-${counter}`;
        counter++;
      }
    }
    
    const updatedArticle: Article = {
      ...existingArticle,
      ...updateData,
      slug,
      updatedAt: new Date().toISOString(),
      readTime: updateData.content ? calculateReadTime(updateData.content) : existingArticle.readTime,
    };
    
    articles[articleIndex] = updatedArticle;
    saveArticles(articles);
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE - Delete an article
export async function DELETE(request: Request) {
  try {
    // Verify admin access
    if (!verifyAdminKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }
    
    const articles = loadArticles();
    const articleIndex = articles.findIndex(a => a.id === id);
    
    if (articleIndex === -1) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const deletedArticle = articles.splice(articleIndex, 1)[0];
    saveArticles(articles);
    
    return NextResponse.json({ message: 'Article deleted successfully', article: deletedArticle });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
} 