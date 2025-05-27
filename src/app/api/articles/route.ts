import { NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import ArticlesService from '@/lib/services/articles';
import { CreateArticleRequest } from '@/types/article';

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

// GET - Fetch articles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const statusParam = searchParams.get('status');
    const status = statusParam as 'draft' | 'published' | 'archived' | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    // Check if admin authentication is provided for unpublished content
    const { isValid: isAdmin } = await verifyAdminAuth(request);

    if (slug) {
      // Get single article by slug
      const article = await ArticlesService.getArticleBySlug(slug);
      
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      // Check if article is published or user is admin
      if (article.status !== 'published' && !isAdmin) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      return NextResponse.json(article);
    }

    let articles;

    if (search) {
      // Search articles
      articles = await ArticlesService.searchArticles(search, {
        includeUnpublished: isAdmin,
        limit,
        offset,
      });
    } else if (tag) {
      // Get articles by tag
      articles = await ArticlesService.getArticlesByTag(tag, limit);
    } else {
      // Get all articles with filtering
      articles = await ArticlesService.getArticles({
        status,
        limit,
        offset,
        includeUnpublished: isAdmin,
      });
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

// POST - Create new article
export async function POST(request: Request) {
  try {
    const { isValid, user } = await verifyAdminAuth(request);
    
    if (!isValid) {
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

    const article = await ArticlesService.createArticle(body, user?.id);
    
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}

// PUT - Update article
export async function PUT(request: Request) {
  try {
    const { isValid, user } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const article = await ArticlesService.updateArticle(id, updates, user?.id);
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE - Delete article
export async function DELETE(request: Request) {
  try {
    const { isValid } = await verifyAdminAuth(request);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const deleted = await ArticlesService.deleteArticle(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
} 