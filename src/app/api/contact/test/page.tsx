'use client';

import { useState } from 'react';

export default function ContactApiTest() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testContactApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message from the API test page',
          service: 'AI Automation',
          timestamp: new Date().toISOString(),
        }),
      });
      
      const data = await response.json();
      
      setResult({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (err) {
      console.error('Error testing API:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-6">Contact API Test</h1>
      
      <button 
        onClick={testContactApi}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Testing...' : 'Test Contact API'}
      </button>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Result</h2>
          <div className="font-mono text-sm">
            <p>Status: {result.status} {result.statusText}</p>
            <pre className="mt-4 p-4 bg-gray-900 text-white rounded overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 