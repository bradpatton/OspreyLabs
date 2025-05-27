export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  featuredImage?: string;
  readTime: number;
  createdAt?: string;
}

export interface CreateArticleRequest {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  featuredImage?: string;
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  id: string;
} 