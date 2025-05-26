'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Article, CreateArticleRequest } from '@/types/article';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<CreateArticleRequest>({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    status: 'draft',
    tags: [],
    featuredImage: '',
  });

  useEffect(() => {
    // Check if admin key is stored in localStorage
    const storedKey = localStorage.getItem('adminKey');
    if (storedKey) {
      setAdminKey(storedKey);
      setIsAuthenticated(true);
      fetchArticles(storedKey);
    }
  }, []);

  const fetchArticles = async (key?: string) => {
    try {
      const response = await fetch('/api/articles', {
        headers: {
          'x-admin-key': key || adminKey,
        },
      });
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey) {
      localStorage.setItem('adminKey', adminKey);
      setIsAuthenticated(true);
      fetchArticles(adminKey);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminKey');
    setAdminKey('');
    setIsAuthenticated(false);
    setArticles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingArticle ? '/api/articles' : '/api/articles';
      const method = editingArticle ? 'PUT' : 'POST';
      const body = editingArticle 
        ? { ...formData, id: editingArticle.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save article');
      }

      const savedArticle = await response.json();
      
      if (editingArticle) {
        setArticles(articles.map(a => a.id === savedArticle.id ? savedArticle : a));
      } else {
        setArticles([savedArticle, ...articles]);
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err instanceof Error ? err.message : 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      setArticles(articles.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Failed to delete article');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      status: article.status,
      tags: article.tags,
      featuredImage: article.featuredImage || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      status: 'draft',
      tags: [],
      featuredImage: '',
    });
    setEditingArticle(null);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                id="adminKey"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full btn btn-primary"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Article Management</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="btn btn-primary"
            >
              New Article
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingArticle ? 'Edit Article' : 'Create New Article'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded h-20"
                  placeholder="Brief description of the article..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded h-40"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="AI, Technology, Tutorial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Image Path
                  </label>
                  <input
                    type="text"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="/images/example.jpg or https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : (editingArticle ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{article.title}</div>
                      <div className="text-sm text-gray-500">{article.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(article.publishedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {articles.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No articles found. Create your first article!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 