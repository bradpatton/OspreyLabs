'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminAuth from '@/components/AdminAuth';

interface DashboardStats {
  articles: {
    total: number;
    published: number;
    draft: number;
  };
  contacts: {
    total: number;
    new: number;
    today: number;
  };
  jobs: {
    total: number;
    new: number;
    today: number;
  };
  chats: {
    totalLogs: number;
    totalThreads: number;
    logsToday: number;
  };
}

const adminSections = [
  {
    title: 'Articles',
    description: 'Manage blog articles, create new posts, and edit existing content.',
    href: '/admin/articles',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 1l4 4v9a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'bg-blue-500'
  },
  {
    title: 'Chat Logs',
    description: 'View and analyze chat conversations from the website chatbot.',
    href: '/admin/chat-logs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'bg-green-500'
  },
  {
    title: 'Contact Submissions',
    description: 'Review and respond to contact form submissions from visitors.',
    href: '/admin/contacts',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-purple-500'
  },
  {
    title: 'Job Applications',
    description: 'Manage job applications and candidate information.',
    href: '/admin/jobs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6" />
      </svg>
    ),
    color: 'bg-orange-500'
  },
  {
    title: 'API Documentation',
    description: 'View API documentation and endpoint information.',
    href: '/admin/api-docs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'bg-gray-500'
  }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const sessionToken = localStorage.getItem('sessionToken');
      const adminKey = localStorage.getItem('adminKey');
      
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['x-session-token'] = sessionToken;
      } else if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const response = await fetch('/api/admin/stats', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      setError('Error fetching statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuth>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to the Osprey Labs admin panel. Select a section to manage.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Quick Stats</h2>
            <button
              onClick={fetchStats}
              className="btn btn-outline btn-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '-' : stats?.articles.total || 0}
              </div>
              <div className="text-sm text-gray-600">Total Articles</div>
              {stats && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.articles.published} published
                </div>
              )}
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {loading ? '-' : stats?.chats.totalThreads || 0}
              </div>
              <div className="text-sm text-gray-600">Chat Threads</div>
              {stats && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.chats.logsToday} today
                </div>
              )}
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {loading ? '-' : stats?.contacts.total || 0}
              </div>
              <div className="text-sm text-gray-600">Contact Forms</div>
              {stats && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.contacts.new} new
                </div>
              )}
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {loading ? '-' : stats?.jobs.total || 0}
              </div>
              <div className="text-sm text-gray-600">Job Applications</div>
              {stats && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.jobs.new} new
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 hover:border-gray-300"
            >
              <div className="flex items-center mb-4">
                <div className={`${section.color} text-white p-3 rounded-lg mr-4`}>
                  {section.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              </div>
              <p className="text-gray-600">{section.description}</p>
              <div className="mt-4 flex items-center text-primary-600 font-medium">
                <span>Manage</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        {stats && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {stats.contacts.today}
                </div>
                <div className="text-sm text-gray-600">New Contact Submissions</div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {stats.jobs.today}
                </div>
                <div className="text-sm text-gray-600">New Job Applications</div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {stats.chats.logsToday}
                </div>
                <div className="text-sm text-gray-600">Chat Messages</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAuth>
  );
} 