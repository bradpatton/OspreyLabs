'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  service: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export default function ContactSubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [expandedSubmissions, setExpandedSubmissions] = useState<Record<string, boolean>>({});
  const [filterService, setFilterService] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let url = '/api/contact';
      const params = new URLSearchParams();
      
      if (dateRange.start) {
        params.append('startDate', new Date(dateRange.start).toISOString());
      }
      
      if (dateRange.end) {
        params.append('endDate', new Date(dateRange.end).toISOString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please enter a valid API key.');
          setIsAuthenticated(false);
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      let filteredSubmissions = data.submissions || [];
      
      // Client-side filtering by service if needed
      if (filterService) {
        filteredSubmissions = filteredSubmissions.filter(
          submission => submission.service.toLowerCase().includes(filterService.toLowerCase())
        );
      }
      
      setSubmissions(filteredSubmissions);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Failed to fetch contact submissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubmissions();
  };

  // Toggle submission expansion
  const toggleSubmission = (id: string) => {
    setExpandedSubmissions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format date and time
  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Export submission as JSON
  const exportSubmission = (submission: ContactSubmission) => {
    const dataStr = JSON.stringify(submission, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `contact-submission-${submission.id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Contact Form Submissions</h1>
        
        {!isAuthenticated ? (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleAuth}>
              <div className="mb-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter your API key"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition"
              >
                Access Submissions
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <Link href="/admin/chat-logs" className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Chat Logs
                </Link>
                <Link href="/admin/job-applications" className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Job Applications
                </Link>
                <Link href="/admin/api-docs" className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  API Documentation
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-xl font-semibold mb-4 md:mb-0">Contact Submissions</h2>
                
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <div className="flex-1 md:flex-none">
                    <label htmlFor="serviceFilter" className="block text-xs font-medium text-gray-700 mb-1">
                      Filter by Service
                    </label>
                    <select
                      id="serviceFilter"
                      value={filterService}
                      onChange={(e) => setFilterService(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    >
                      <option value="">All Services</option>
                      <option value="AI Automation">AI Automation</option>
                      <option value="Custom Software">Custom Software</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 md:flex-none">
                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex-1 md:flex-none">
                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex-none self-end">
                    <button
                      onClick={fetchSubmissions}
                      className="bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Apply Filters'}
                    </button>
                  </div>
                </div>
              </div>
              
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isLoading ? 'Loading submissions...' : 'No contact submissions found'}
                </div>
              ) : (
                <div className="space-y-6">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleSubmission(submission.id)}
                      >
                        <div>
                          <h3 className="font-medium">{submission.name}</h3>
                          <div className="flex flex-col sm:flex-row sm:gap-4">
                            <p className="text-sm text-gray-600">{submission.email}</p>
                            {submission.phone && (
                              <p className="text-sm text-gray-600">{submission.phone}</p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:gap-4 mt-1">
                            <p className="text-sm text-gray-500">
                              {formatDateTime(submission.timestamp)}
                            </p>
                            <p className="text-sm text-primary-600">
                              {submission.service}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportSubmission(submission);
                            }}
                            className="text-primary-600 hover:text-primary-800 text-sm"
                            title="Export submission as JSON"
                          >
                            Export
                          </button>
                          <span className="text-gray-400">
                            {expandedSubmissions[submission.id] ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                      
                      {expandedSubmissions[submission.id] && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="space-y-4">
                            {submission.company && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Company:</p>
                                <p className="text-sm">{submission.company}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Message:</p>
                              <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm whitespace-pre-wrap">{submission.message}</p>
                              </div>
                            </div>
                            
                            <div className="pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-1">Submission ID: {submission.id}</p>
                              {submission.userAgent && (
                                <p className="text-xs text-gray-500">User Agent: {submission.userAgent}</p>
                              )}
                              {submission.ip && (
                                <p className="text-xs text-gray-500">IP: {submission.ip}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 