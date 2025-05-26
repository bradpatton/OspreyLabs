'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminAuth from '@/components/AdminAuth';

interface ChatLogEntry {
  threadId: string;
  timestamp: string;
  userMessage: string;
  assistantResponse: string;
  userAgent?: string;
  ip?: string;
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
  const router = useRouter();

  useEffect(() => {
    fetchLogs();
  }, []);

  const getAdminKey = () => {
    return localStorage.getItem('adminKey') || '';
  };

  // Group logs by thread ID
  const groupLogsByThread = (logs: ChatLogEntry[]): ChatThread[] => {
    const threadMap: Record<string, ChatLogEntry[]> = {};
    
    // Group messages by threadId
    logs.forEach(log => {
      if (!threadMap[log.threadId]) {
        threadMap[log.threadId] = [];
      }
      threadMap[log.threadId].push(log);
    });
    
    // Create thread objects with sorted messages
    return Object.entries(threadMap).map(([threadId, messages]) => {
      // Sort messages by timestamp (oldest first for conversation flow)
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      return {
        threadId,
        messages: sortedMessages,
        firstTimestamp: sortedMessages[0].timestamp,
        lastTimestamp: sortedMessages[sortedMessages.length - 1].timestamp,
        userAgent: sortedMessages[0].userAgent
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
      const response = await fetch('/api/chat-logs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAdminKey()}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please check your admin access.');
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      const logEntries = data.logs || [];
      setLogs(logEntries);
      
      // Group logs by thread
      const groupedThreads = groupLogsByThread(logEntries);
      setThreads(groupedThreads);
      
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
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Conversation Threads</h2>
            <div className="flex space-x-2">
              <button
                onClick={fetchLogs}
                className="bg-primary-600 text-white py-1 px-4 rounded hover:bg-primary-700 transition text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {threads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? 'Loading threads...' : 'No chat threads found'}
            </div>
          ) : (
            <div className="space-y-6">
              {threads.map((thread) => (
                <div key={thread.threadId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
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
                    </div>
                    <div className="flex space-x-2">
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
                    <div className="p-4 border-t border-gray-200">
                      <div className="space-y-4">
                        {thread.messages.map((message, idx) => (
                          <div key={idx} className="flex flex-col space-y-2">
                            <div className="mb-3 bg-blue-50 p-3 rounded">
                              <div className="flex justify-between">
                                <p className="text-xs font-medium text-gray-500 mb-1">User:</p>
                                <p className="text-xs text-gray-500">{formatDateTime(message.timestamp)}</p>
                              </div>
                              <p className="text-sm">{message.userMessage}</p>
                            </div>
                            
                            <div className="bg-green-50 p-3 rounded">
                              <p className="text-xs font-medium text-gray-500 mb-1">Assistant:</p>
                              <p className="text-sm whitespace-pre-wrap">{message.assistantResponse}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {thread.userAgent && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">User Agent: {thread.userAgent}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminAuth>
  );
} 