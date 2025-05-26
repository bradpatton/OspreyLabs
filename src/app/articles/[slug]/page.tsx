'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Article } from '@/types/article';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles?slug=${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found');
        } else {
          throw new Error('Failed to fetch article');
        }
        return;
      }
      const data = await response.json();
      setArticle(data);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Enhanced content processing for better formatting
  const processContent = (content: string) => {
    let processed = content;
    
    // Step 1: Handle code blocks first (to protect them from other processing)
    const codeBlocks: string[] = [];
    processed = processed.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      const index = codeBlocks.length;
      codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`);
      return `__CODE_BLOCK_${index}__`;
    });
    
    // Step 2: Handle inline code (protect from other processing)
    const inlineCodes: string[] = [];
    processed = processed.replace(/`([^`\n]+)`/g, (match, code) => {
      const index = inlineCodes.length;
      inlineCodes.push(`<code>${code}</code>`);
      return `__INLINE_CODE_${index}__`;
    });
    
    // Step 3: Handle headers (must be at start of line)
    processed = processed.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    processed = processed.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    processed = processed.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    processed = processed.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Step 4: Handle horizontal rules
    processed = processed.replace(/^---+$/gm, '<hr>');
    
    // Step 5: Handle blockquotes
    processed = processed.replace(/^> (.*)$/gm, '<blockquote><p>$1</p></blockquote>');
    // Merge consecutive blockquotes
    processed = processed.replace(/<\/blockquote>\s*<blockquote>/g, '');
    
    // Step 6: Handle lists
    // Unordered lists
    processed = processed.replace(/^[\s]*[-*+] (.*)$/gm, '<li>$1</li>');
    // Ordered lists  
    processed = processed.replace(/^[\s]*\d+\. (.*)$/gm, '<li>$1</li>');
    
    // Wrap consecutive list items in ul/ol tags
    processed = processed.replace(/(<li>.*<\/li>)(\s*<li>.*<\/li>)*/g, (match) => {
      return `<ul>${match}</ul>`;
    });
    
    // Step 7: Handle bold and italic (be careful with order)
    processed = processed.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Step 8: Handle links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Step 9: Handle line breaks and paragraphs
    // Split by double line breaks for paragraphs
    const paragraphs = processed.split(/\n\s*\n/);
    processed = paragraphs.map(para => {
      para = para.trim();
      if (!para) return '';
      
      // Don't wrap headers, lists, blockquotes, hrs in paragraphs
      if (para.match(/^<(h[1-6]|ul|ol|blockquote|hr|pre)/)) {
        return para;
      }
      
      // Convert single line breaks to <br> within paragraphs
      para = para.replace(/\n/g, '<br>');
      return `<p>${para}</p>`;
    }).join('\n');
    
    // Step 10: Restore code blocks and inline code
    codeBlocks.forEach((code, index) => {
      processed = processed.replace(`__CODE_BLOCK_${index}__`, code);
    });
    
    inlineCodes.forEach((code, index) => {
      processed = processed.replace(`__INLINE_CODE_${index}__`, code);
    });
    
    // Step 11: Clean up extra whitespace and empty elements
    processed = processed.replace(/<p><\/p>/g, '');
    processed = processed.replace(/\s+/g, ' ');
    processed = processed.replace(/>\s+</g, '><');
    
    return processed.trim();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{error || 'Article not found'}</h1>
            <Link href="/articles" className="btn btn-primary">
              Back to Articles
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      {/* Article Header */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                href="/articles" 
                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
              >
                ← Back to Articles
              </Link>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span>By {article.author}</span>
                <span>•</span>
                <span>{formatDate(article.publishedAt)}</span>
                <span>•</span>
                <span>{article.readTime} min read</span>
              </div>
              
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/20 text-white text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {article.featuredImage && (
        <section className="py-8">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-lg overflow-hidden shadow-lg"
              >
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="prose prose-lg max-w-none"
            >
              {article.excerpt && (
                <div className="text-xl text-gray-600 mb-12 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-l-4 border-primary-600 shadow-sm">
                  <div className="font-medium text-primary-600 text-sm uppercase tracking-wide mb-2">
                    Article Summary
                  </div>
                  {article.excerpt}
                </div>
              )}
              
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: processContent(article.content) }}
              />
            </motion.article>
          </div>
        </div>
      </section>

      {/* Article Footer */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-gray-600 mb-2">Published on {formatDate(article.publishedAt)}</p>
                {article.updatedAt !== article.publishedAt && (
                  <p className="text-gray-500 text-sm">Last updated: {formatDate(article.updatedAt)}</p>
                )}
              </div>
              
              <div className="flex gap-4">
                <Link href="/articles" className="btn btn-outline">
                  More Articles
                </Link>
                <Link href="/contact" className="btn btn-primary">
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 