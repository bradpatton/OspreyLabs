'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Article } from '@/types/article';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?status=published');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
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

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Articles & Insights
            </motion.h1>
            <motion.p 
              className="text-lg opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Stay updated with the latest trends in AI, automation, and software development.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          {error ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchArticles}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No Articles Yet</h2>
              <p className="text-gray-600">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {article.featuredImage && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>{formatDate(article.publishedAt)}</span>
                      <span className="mx-2">•</span>
                      <span>{article.readTime} min read</span>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-3 line-clamp-2">
                      <Link 
                        href={`/articles/${article.slug}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{article.tags.length - 2} more
                          </span>
                        )}
                      </div>
                      
                      <Link 
                        href={`/articles/${article.slug}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Read More →
                      </Link>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">By {article.author}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
} 