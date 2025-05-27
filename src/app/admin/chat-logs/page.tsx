'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminAuth from '@/components/AdminAuth';

interface ChatLogEntry {
  id: string;
  thread_id: string;
  user_message: string;
  assistant_response: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Interface for grouped chat threads
interface ChatThread {
  threadId: string;
  messages: ChatLogEntry[];
  firstTimestamp: string;
  lastTimestamp: string;
  userAgent?: string;
}

export default function ChatLogsAdmin() {
  const [logs, setLogs] = useState<ChatLogEntry[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'threads' | 'logs'>('threads');
  const router = useRouter();

  useEffect(() => {
    fetchLogs();
  }, [viewMode, searchTerm]);

  // Group logs by thread ID
  const groupLogsByThread = (logs: ChatLogEntry[]): ChatThread[] => {
    const threadMap: Record<string, ChatLogEntry[]> = {};
    
    // Group messages by threadId
    logs.forEach(log => {
      if (!threadMap[log.thread_id]) {
        threadMap[log.thread_id] = [];
      }
      threadMap[log.thread_id].push(log);
    });
    
    // Create thread objects with sorted messages
    return Object.entries(threadMap).map(([threadId, messages]) => {
      // Sort messages by timestamp (oldest first for conversation flow)
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      return {
        threadId,
        messages: sortedMessages,
        firstTimestamp: sortedMessages[0].created_at,
        lastTimestamp: sortedMessages[sortedMessages.length - 1].created_at,
        userAgent: sortedMessages[0].user_agent
      };
    }).sort(
      // Sort threads by most recent activity first
      (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const adminKey = localStorage.getItem('adminKey');
      
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['x-session-token'] = sessionToken;
      } else if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const params = new URLSearchParams();
      if (viewMode === 'threads') {
        params.append('grouped', 'true');
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/chat-logs?${params.toString()}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please check your admin access.');
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (viewMode === 'threads') {
        setThreads(data);
        setLogs([]);
      } else {
        setLogs(data);
        const groupedThreads = groupLogsByThread(data);
        setThreads(groupedThreads);
      }
      
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError('Failed to fetch logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle thread expansion
  const toggleThread = (threadId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }));
  };

  // Format date and time
  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Export thread as JSON
  const exportThread = (thread: ChatThread) => {
    const dataStr = JSON.stringify(thread, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `chat-thread-${thread.threadId}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Delete old logs
  const deleteOldLogs = async (daysOld: number) => {
    if (!confirm(`Are you sure you want to delete chat logs older than ${daysOld} days?`)) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const adminKey = localStorage.getItem('adminKey');
      
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['x-session-token'] = sessionToken;
      } else if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const response = await fetch(`/api/chat-logs?daysOld=${daysOld}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchLogs(); // Refresh the logs
      } else {
        setError('Failed to delete old logs');
      }
    } catch (err) {
      setError('Error deleting old logs');
      console.error(err);
    }
  };

  return (
    <AdminAuth>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Chat Logs Admin</h1>
        
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

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'threads' | 'logs')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="threads">Grouped by Threads</option>
                <option value="logs">All Logs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={fetchLogs}
                className="btn btn-outline"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={() => deleteOldLogs(30)}
                className="btn btn-danger"
                title="Delete logs older than 30 days"
              >
                Cleanup
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {viewMode === 'threads' ? 'Conversation Threads' : 'All Chat Logs'}
            </h2>
            <div className="text-sm text-gray-600">
              {viewMode === 'threads' ? `${threads.length} threads` : `${logs.length} messages`}
            </div>
          </div>
          
          {(viewMode === 'threads' ? threads.length === 0 : logs.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? 'Loading...' : 'No chat logs found'}
            </div>
          ) : viewMode === 'threads' ? (
            <div className="space-y-6">
              {threads.map((thread) => (
                <div key={thread.threadId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center hover:bg-gray-100"
                    onClick={() => toggleThread(thread.threadId)}
                  >
                    <div>
                      <h3 className="font-medium">Thread: {thread.threadId}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(thread.firstTimestamp)} - {formatDateTime(thread.lastTimestamp)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
                      </p>
                      {thread.userAgent && (
                        <p className="text-xs text-gray-500 truncate max-w-md">
                          {thread.userAgent}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportThread(thread);
                        }}
                        className="text-primary-600 hover:text-primary-800 text-sm"
                        title="Export thread as JSON"
                      >
                        Export
                      </button>
                      <span className="text-gray-400">
                        {expandedThreads[thread.threadId] ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {expandedThreads[thread.threadId] && (
                    <div className="p-4 space-y-4 bg-white">
                      {thread.messages.map((message, index) => (
                        <div key={message.id} className="border-l-4 border-gray-200 pl-4">
                          <div className="text-xs text-gray-500 mb-1">
                            {formatDateTime(message.created_at)}
                            {message.ip_address && ` • IP: ${message.ip_address}`}
                          </div>
                          <div className="mb-2">
                            <strong className="text-blue-600">User:</strong>
                            <p className="text-gray-800 whitespace-pre-wrap">{message.user_message}</p>
                          </div>
                          <div>
                            <strong className="text-green-600">Assistant:</strong>
                            <p className="text-gray-800 whitespace-pre-wrap">{message.assistant_response}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-2">
                    Thread: {log.thread_id} • {formatDateTime(log.created_at)}
                    {log.ip_address && ` • IP: ${log.ip_address}`}
                  </div>
                  <div className="mb-2">
                    <strong className="text-blue-600">User:</strong>
                    <p className="text-gray-800 whitespace-pre-wrap">{log.user_message}</p>
                  </div>
                  <div>
                    <strong className="text-green-600">Assistant:</strong>
                    <p className="text-gray-800 whitespace-pre-wrap">{log.assistant_response}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminAuth>
  );
} 