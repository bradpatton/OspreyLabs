export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  tags: string[];
  featuredImage?: string;
  readTime: number;
}

export interface CreateArticleRequest {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  status: 'draft' | 'published';
  tags: string[];
  featuredImage?: string;
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  id: string;
} 