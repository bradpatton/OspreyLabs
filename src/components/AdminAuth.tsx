'use client';

import { useState, useEffect, ReactNode } from 'react';
import AdminNav from './AdminNav';

interface AdminAuthProps {
  children: ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if admin key is stored in localStorage
    const storedKey = localStorage.getItem('adminKey');
    if (storedKey) {
      setAdminKey(storedKey);
      validateAdminKey(storedKey);
    } else {
      setLoading(false);
    }
  }, []);

  const validateAdminKey = async (key: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'x-admin-key': key,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        // Invalid key, remove from localStorage
        localStorage.removeItem('adminKey');
        setAdminKey('');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error validating admin key:', err);
      localStorage.removeItem('adminKey');
      setAdminKey('');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (adminKey) {
      try {
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: {
            'x-admin-key': adminKey,
          },
        });

        if (response.ok) {
          localStorage.setItem('adminKey', adminKey);
          setIsAuthenticated(true);
        } else {
          setError('Invalid admin key');
        }
      } catch (err) {
        console.error('Error validating admin key:', err);
        setError('Failed to validate admin key');
      }
    } else {
      setError('Please enter an admin key');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminKey');
    setAdminKey('');
    setIsAuthenticated(false);
  };

  // Show loading spinner while validating stored key
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating access...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
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
                placeholder="Enter your admin key"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Validating...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Need access? Contact your administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render children with logout functionality available
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="btn btn-outline text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <AdminNav />
      <div className="pb-8">
        {children}
      </div>
    </div>
  );
} 