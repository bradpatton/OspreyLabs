'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ApiDocs() {
  const [apiKey, setApiKey] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string>('chat-logs');

  const testApiConnection = async (endpoint: string) => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      const response = await fetch(`/api/${endpoint}?limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to connect to API');
        return;
      }
      
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError('Error connecting to API');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">API Documentation</h1>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <p className="mb-4">
            All API endpoints require authentication using a Bearer token in the Authorization header.
          </p>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <code className="text-sm">
              Authorization: Bearer your_admin_api_key
            </code>
          </div>
          
          <div className="mt-6 mb-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium mb-2">Test Your API Key</h3>
            <div className="flex flex-col md:flex-row items-end gap-4 mb-4">
              <div className="flex-1">
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
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint to Test
                </label>
                <select
                  id="endpoint"
                  value={activeEndpoint}
                  onChange={(e) => setActiveEndpoint(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="chat-logs">Chat Logs</option>
                  <option value="contact">Contact Submissions</option>
                  <option value="careers">Job Applications</option>
                </select>
              </div>
              <div className="flex-none">
                <button
                  onClick={() => testApiConnection(activeEndpoint)}
                  disabled={!apiKey || isLoading}
                  className="bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {testResult && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">API Response:</h4>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs for different API endpoints */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveEndpoint('chat-logs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeEndpoint === 'chat-logs'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chat Logs API
              </button>
              <button
                onClick={() => setActiveEndpoint('contact')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeEndpoint === 'contact'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contact Submissions API
              </button>
              <button
                onClick={() => setActiveEndpoint('careers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeEndpoint === 'careers'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Job Applications API
              </button>
            </nav>
          </div>
        </div>
        
        {/* Chat Logs API Documentation */}
        {activeEndpoint === 'chat-logs' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Chat Logs API</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Get Chat Logs</h3>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <code className="text-sm">
                  GET /api/chat-logs
                </code>
              </div>
              <p className="mb-2">Returns all chat logs or filtered logs based on query parameters.</p>
              
              <h4 className="font-medium mt-4 mb-2">Query Parameters</h4>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Parameter</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Type</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">threadId</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter logs by thread ID</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">format</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Response format: 'raw' (default) or 'grouped'</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">startDate</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">ISO date string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter logs after this date</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">endDate</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">ISO date string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter logs before this date</td>
                  </tr>
                </tbody>
              </table>
              
              <h4 className="font-medium mt-4 mb-2">Example Response (raw format)</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
{`{
  "logs": [
    {
      "threadId": "abc123",
      "timestamp": "2023-01-15T14:23:45Z",
      "userMessage": "Hello, how can you help me?",
      "assistantResponse": "Hi there! I'm the Osprey Labs assistant. I can help with information about our services.",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    // More log entries...
  ],
  "total": 42
}`}
              </pre>
            </div>
          </div>
        )}
        
        {/* Contact Submissions API Documentation */}
        {activeEndpoint === 'contact' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Contact Submissions API</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Get Contact Submissions</h3>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <code className="text-sm">
                  GET /api/contact
                </code>
              </div>
              <p className="mb-2">Returns all contact form submissions or filtered submissions based on query parameters.</p>
              
              <h4 className="font-medium mt-4 mb-2">Query Parameters</h4>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Parameter</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Type</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">id</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter by submission ID</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">startDate</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">ISO date string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter submissions after this date</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">endDate</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">ISO date string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter submissions before this date</td>
                  </tr>
                </tbody>
              </table>
              
              <h3 className="text-lg font-medium mt-8 mb-2">Submit Contact Form</h3>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <code className="text-sm">
                  POST /api/contact
                </code>
              </div>
              <p className="mb-2">Submits a new contact form entry. This endpoint does not require authentication.</p>
              
              <h4 className="font-medium mt-4 mb-2">Request Body</h4>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Field</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Type</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Required</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">name</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Yes</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Full name of the submitter</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">email</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Yes</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Email address</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">phone</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Phone number</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">company</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Company name</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">message</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Yes</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Message content</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">service</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Service of interest</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">timestamp</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">ISO timestamp (server will add if not provided)</td>
                  </tr>
                </tbody>
              </table>
              
              <h4 className="font-medium mt-4 mb-2">Example Response</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
{`{
  "submissions": [
    {
      "id": "abc123xyz456",
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+1 555-123-4567",
      "company": "Acme Inc",
      "message": "I'm interested in AI automation for our customer service department.",
      "service": "AI Automation",
      "timestamp": "2023-01-15T14:23:45Z",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    // More submissions...
  ],
  "total": 18
}`}
              </pre>
            </div>
          </div>
        )}
        
        {/* Job Applications API Documentation */}
        {activeEndpoint === 'careers' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Job Applications API</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Get Job Applications</h3>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <code className="text-sm">
                  GET /api/careers
                </code>
              </div>
              <p className="mb-2">Returns all job applications or filtered applications based on query parameters.</p>
              
              <h4 className="font-medium mt-4 mb-2">Query Parameters</h4>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Parameter</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Type</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">id</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter by application ID</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">jobId</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter by job ID</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">status</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter by application status (new, reviewed, interviewing, hired, rejected)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">startDate</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">ISO date string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter applications after this date</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">endDate</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">ISO date string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Filter applications before this date</td>
                  </tr>
                </tbody>
              </table>
              
              <h3 className="text-lg font-medium mt-8 mb-2">Submit Job Application</h3>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <code className="text-sm">
                  POST /api/careers
                </code>
              </div>
              <p className="mb-2">Submits a new job application. This endpoint does not require authentication.</p>
              
              <h4 className="font-medium mt-4 mb-2">Request Body (FormData)</h4>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Field</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Type</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Required</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">firstName</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Yes</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">First name of the applicant</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">lastName</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Yes</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Last name of the applicant</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">email</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Yes</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Email address</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">phone</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Phone number</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">linkedIn</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">LinkedIn profile URL</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">portfolio</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Portfolio or GitHub URL</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">resume</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">File</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Yes</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Resume/CV file</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">coverLetter</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Cover letter text</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">jobId</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">ID of the job being applied for</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">jobTitle</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Title of the job being applied for</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">heardAbout</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">No</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">How the applicant heard about the position</td>
                  </tr>
                </tbody>
              </table>
              
              <h3 className="text-lg font-medium mt-8 mb-2">Update Application Status</h3>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <code className="text-sm">
                  PATCH /api/careers
                </code>
              </div>
              <p className="mb-2">Updates the status of a job application. This endpoint requires authentication.</p>
              
              <h4 className="font-medium mt-4 mb-2">Request Body</h4>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Field</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Type</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Required</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border border-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">id</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Yes</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Application ID to update</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-sm border border-gray-200">status</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">string</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">Yes</td>
                    <td className="py-2 px-4 text-sm border border-gray-200">New status (new, reviewed, interviewing, hired, rejected)</td>
                  </tr>
                </tbody>
              </table>
              
              <h4 className="font-medium mt-4 mb-2">Example Response</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
{`{
  "applications": [
    {
      "id": "abc123xyz456",
      "jobId": "frontend-dev-1",
      "jobTitle": "Senior Frontend Developer",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1 555-987-6543",
      "linkedIn": "https://linkedin.com/in/janesmith",
      "portfolio": "https://github.com/janesmith",
      "resumeFileName": "jane-smith-resume.pdf",
      "coverLetter": "I'm excited to apply for the Senior Frontend Developer position...",
      "heardAbout": "LinkedIn",
      "timestamp": "2023-01-15T14:23:45Z",
      "status": "new",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    // More applications...
  ],
  "total": 12
}`}
              </pre>
            </div>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">JavaScript / Node.js</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
{`// Using fetch API
async function getApiData(endpoint = 'chat-logs', params = {}) {
  const url = new URL(\`https://your-domain.com/api/\${endpoint}\`);
  
  // Add query parameters
  Object.keys(params).forEach(key => 
    url.searchParams.append(key, params[key])
  );
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer your_admin_api_key'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  
  const data = await response.json();
  return data;
}

// Example: Submit contact form
async function submitContactForm(formData) {
  const response = await fetch('https://your-domain.com/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit form');
  }
  
  return await response.json();
}`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Python</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
{`import requests

def get_api_data(endpoint='chat-logs', params=None):
    url = f'https://your-domain.com/api/{endpoint}'
    headers = {
        'Authorization': 'Bearer your_admin_api_key'
    }
    
    response = requests.get(url, headers=headers, params=params or {})
    response.raise_for_status()  # Raise exception for 4XX/5XX responses
    
    return response.json()

# Example: Submit contact form
def submit_contact_form(form_data):
    url = 'https://your-domain.com/api/contact'
    headers = {
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers, json=form_data)
    response.raise_for_status()
    
    return response.json()`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 