'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JobApplication {
  id: string;
  jobId: string | null;
  jobTitle: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedIn: string;
  portfolio: string;
  resumeFileName: string;
  coverLetter: string;
  heardAbout: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  status: 'new' | 'reviewed' | 'interviewing' | 'rejected' | 'hired';
}

export default function JobApplicationsAdmin() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [expandedApplications, setExpandedApplications] = useState<Record<string, boolean>>({});
  
  // Filter states
  const [jobTitleFilter, setJobTitleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchApplications = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let url = '/api/careers';
      const params = new URLSearchParams();
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
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
      let filteredApplications = data.applications || [];
      
      // Client-side filtering by job title if needed
      if (jobTitleFilter) {
        filteredApplications = filteredApplications.filter(
          app => app.jobTitle && app.jobTitle.toLowerCase().includes(jobTitleFilter.toLowerCase())
        );
      }
      
      setApplications(filteredApplications);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to fetch job applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  // Toggle application expansion
  const toggleApplication = (id: string) => {
    setExpandedApplications(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format date and time
  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Update application status
  const updateApplicationStatus = async (id: string, newStatus: JobApplication['status']) => {
    try {
      const response = await fetch('/api/careers', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Update local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error('Failed to update application status:', err);
      setError('Failed to update application status. Please try again.');
    }
  };

  // Export application as JSON
  const exportApplication = (application: JobApplication) => {
    const dataStr = JSON.stringify(application, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `job-application-${application.id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Get unique job titles for filter
  const jobTitles = [...new Set(applications
    .filter(app => app.jobTitle)
    .map(app => app.jobTitle as string)
  )];

  // Get status badge color
  const getStatusBadgeColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'interviewing':
        return 'bg-purple-100 text-purple-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Job Applications</h1>
        
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
                Access Applications
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <Link href="/admin/contact-submissions" className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Submissions
                </Link>
                <Link href="/admin/chat-logs" className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Chat Logs
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
                <h2 className="text-xl font-semibold mb-4 md:mb-0">Job Applications</h2>
                
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <div className="flex-1 md:flex-none">
                    <label htmlFor="jobTitleFilter" className="block text-xs font-medium text-gray-700 mb-1">
                      Filter by Position
                    </label>
                    <select
                      id="jobTitleFilter"
                      value={jobTitleFilter}
                      onChange={(e) => setJobTitleFilter(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    >
                      <option value="">All Positions</option>
                      {jobTitles.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1 md:flex-none">
                    <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-700 mb-1">
                      Filter by Status
                    </label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    >
                      <option value="">All Statuses</option>
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
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
                      onClick={fetchApplications}
                      className="bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Apply Filters'}
                    </button>
                  </div>
                </div>
              </div>
              
              {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isLoading ? 'Loading applications...' : 'No job applications found'}
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleApplication(application.id)}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {application.firstName} {application.lastName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(application.status)}`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:gap-4">
                            <p className="text-sm text-gray-600">{application.email}</p>
                            {application.phone && (
                              <p className="text-sm text-gray-600">{application.phone}</p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:gap-4 mt-1">
                            <p className="text-sm text-gray-500">
                              {formatDateTime(application.timestamp)}
                            </p>
                            {application.jobTitle && (
                              <p className="text-sm text-primary-600">
                                {application.jobTitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportApplication(application);
                            }}
                            className="text-primary-600 hover:text-primary-800 text-sm"
                            title="Export application as JSON"
                          >
                            Export
                          </button>
                          <span className="text-gray-400">
                            {expandedApplications[application.id] ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                      
                      {expandedApplications[application.id] && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Position:</p>
                                <p className="text-sm">{application.jobTitle || 'General Application'}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Resume:</p>
                                <p className="text-sm">{application.resumeFileName}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {application.linkedIn && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 mb-1">LinkedIn:</p>
                                  <a 
                                    href={application.linkedIn} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary-600 hover:underline"
                                  >
                                    {application.linkedIn}
                                  </a>
                                </div>
                              )}
                              
                              {application.portfolio && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 mb-1">Portfolio/GitHub:</p>
                                  <a 
                                    href={application.portfolio} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary-600 hover:underline"
                                  >
                                    {application.portfolio}
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            {application.coverLetter && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Cover Letter:</p>
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Update Status:</p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'new')}
                                  className={`px-2 py-1 text-xs rounded ${application.status === 'new' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                                >
                                  New
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                                  className={`px-2 py-1 text-xs rounded ${application.status === 'reviewed' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                                >
                                  Reviewed
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'interviewing')}
                                  className={`px-2 py-1 text-xs rounded ${application.status === 'interviewing' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
                                >
                                  Interviewing
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'hired')}
                                  className={`px-2 py-1 text-xs rounded ${application.status === 'hired' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                                >
                                  Hired
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                  className={`px-2 py-1 text-xs rounded ${application.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                                >
                                  Rejected
                                </button>
                              </div>
                            </div>
                            
                            <div className="pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-1">Application ID: {application.id}</p>
                              {application.heardAbout && (
                                <p className="text-xs text-gray-500">Heard about us from: {application.heardAbout}</p>
                              )}
                              {application.userAgent && (
                                <p className="text-xs text-gray-500">User Agent: {application.userAgent}</p>
                              )}
                              {application.ip && (
                                <p className="text-xs text-gray-500">IP: {application.ip}</p>
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