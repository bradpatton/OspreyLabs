# Articles System

This document explains how to use the articles system in the Osprey Labs website.

## Overview

The articles system provides:
- Public articles page at `/articles`
- Individual article pages at `/articles/[slug]`
- Admin interface at `/admin/articles`
- REST API at `/api/articles`

## Features

### Public Features
- **Articles Listing**: Browse all published articles with pagination
- **Article Reading**: Read individual articles with rich formatting
- **Search & Filtering**: Filter articles by tags and status
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Create Articles**: Add new articles with rich content
- **Edit Articles**: Update existing articles
- **Delete Articles**: Remove articles (with confirmation)
- **Draft/Publish**: Control article visibility
- **Tag Management**: Organize articles with tags
- **Featured Images**: Add images to articles

## API Endpoints

### GET `/api/articles`
Fetch articles with optional filtering:
- `?status=published` - Only published articles
- `?status=draft` - Only draft articles
- `?id=123` - Specific article by ID
- `?slug=article-slug` - Specific article by slug

### POST `/api/articles`
Create a new article (requires admin key):
```json
{
  "title": "Article Title",
  "excerpt": "Brief description",
  "content": "Full article content",
  "author": "Author Name",
  "status": "draft|published",
  "tags": ["tag1", "tag2"],
  "featuredImage": "https://example.com/image.jpg"
}
```

### PUT `/api/articles`
Update an existing article (requires admin key):
```json
{
  "id": "article-id",
  "title": "Updated Title",
  // ... other fields to update
}
```

### DELETE `/api/articles?id=123`
Delete an article (requires admin key)

## Admin Access

To access the admin interface:

1. Navigate to `/admin/articles`
2. Enter your admin API key (set in `ADMIN_API_KEY` environment variable)
3. The key is stored in localStorage for convenience

## Data Storage

Currently uses file-based storage in `data/articles.json`. For production, consider migrating to a database like PostgreSQL or MongoDB.

## Environment Variables

Required environment variables:
- `ADMIN_API_KEY` - Secret key for admin access

## Content Formatting

Articles support:
- **Markdown-style formatting** in content
- **HTML tags** for rich formatting
- **Line breaks** are automatically converted to `<br>` tags
- **Code blocks** with syntax highlighting
- **Links, bold, italic** text formatting

## Security

- Admin endpoints require API key authentication
- Public endpoints only serve published articles
- Input validation on all API endpoints
- XSS protection through proper content sanitization

## Usage Examples

### Creating an Article via API
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "x-admin-key: your-admin-key" \
  -d '{
    "title": "My New Article",
    "excerpt": "This is a great article",
    "content": "Full content here...",
    "author": "John Doe",
    "status": "published",
    "tags": ["tech", "ai"]
  }'
```

### Fetching Published Articles
```bash
curl http://localhost:3000/api/articles?status=published
```

## File Structure

```
src/
├── app/
│   ├── articles/
│   │   ├── page.tsx              # Articles listing page
│   │   └── [slug]/
│   │       └── page.tsx          # Individual article page
│   ├── admin/
│   │   └── articles/
│   │       └── page.tsx          # Admin interface
│   └── api/
│       └── articles/
│           └── route.ts          # API endpoints
├── types/
│   └── article.ts                # TypeScript types
└── components/
    ├── Header.tsx                # Updated with Articles link
    └── ...

data/
└── articles.json                 # Article storage (gitignored)
```

## Future Enhancements

Consider implementing:
- Database integration (PostgreSQL, MongoDB)
- Image upload functionality
- Rich text editor (WYSIWYG)
- Article categories
- Comments system
- SEO optimization
- Article analytics
- Bulk operations
- Article versioning
- Content scheduling 