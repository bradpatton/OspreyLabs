'use client';

import { useState, useEffect, ReactNode } from 'react';
import AdminNav from './AdminNav';

interface AdminAuthProps {
  children: ReactNode;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState<'username' | 'apikey'>('username');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Check if session token or API key is stored
    const sessionToken = localStorage.getItem('sessionToken');
    const storedApiKey = localStorage.getItem('adminKey');
    
    if (sessionToken) {
      validateSession(sessionToken);
    } else if (storedApiKey) {
      setApiKey(storedApiKey);
      validateApiKey(storedApiKey);
    } else {
      setLoading(false);
    }
  }, []);

  const validateSession = async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'x-session-token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Invalid session, remove from localStorage
        localStorage.removeItem('sessionToken');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error validating session:', err);
      localStorage.removeItem('sessionToken');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const validateApiKey = async (key: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'x-admin-key': key,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Invalid key, remove from localStorage
        localStorage.removeItem('adminKey');
        setApiKey('');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error validating API key:', err);
      localStorage.removeItem('adminKey');
      setApiKey('');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Store session token
        localStorage.setItem('sessionToken', data.session.token);
        
        // Clear form
        setUsername('');
        setPassword('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!apiKey) {
      setError('Please enter an API key');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'x-admin-key': apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('adminKey', apiKey);
      } else {
        setError('Invalid API key');
      }
    } catch (err) {
      console.error('Error validating API key:', err);
      setError('Failed to validate API key');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    
    // If we have a session token, invalidate it on the server
    if (sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'x-session-token': sessionToken,
          },
        });
      } catch (err) {
        console.error('Error during logout:', err);
      }
    }

    // Clear local storage and state
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('adminKey');
    setUser(null);
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setApiKey('');
  };

  // Show loading spinner while validating stored credentials
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
          
          {/* Login mode toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLoginMode('username')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'username'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Username/Password
            </button>
            <button
              onClick={() => setLoginMode('apikey')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'apikey'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              API Key
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {loginMode === 'username' ? (
            <form onSubmit={handleUsernameLogin}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
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
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleApiKeyLogin}>
              <div className="mb-6">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your API key"
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
          )}
          
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
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
              {user && (
                <p className="text-sm text-gray-600">
                  Welcome, {user.username} ({user.role})
                </p>
              )}
            </div>
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