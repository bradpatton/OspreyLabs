'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  createThread, 
  sendMessageAndGetResponse
} from '@/utils/openai';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Function to log chat messages
async function logChatMessage(threadId: string, userMessage: string, assistantResponse: string) {
  try {
    await fetch('/api/chat-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        threadId,
        userMessage,
        assistantResponse,
      }),
    });
  } catch (error) {
    console.error('Failed to log chat message:', error);
    // Non-blocking error - we still want the chat to work even if logging fails
  }
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [showInitialAnimation, setShowInitialAnimation] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get time-based greeting for UI elements
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Auto-open chat after 25 seconds
  useEffect(() => {
    if (!hasAutoOpened) {
      const timer = setTimeout(() => {
        setShowInitialAnimation(true);
        
        // Wait for animation to complete before opening chat
        setTimeout(() => {
          setIsOpen(true);
          setHasAutoOpened(true);
          playNotificationSound();
        }, 1000);
      }, 25000); // 25 seconds in milliseconds
      
      return () => clearTimeout(timer);
    }
  }, [hasAutoOpened]);

  // Initialize the thread when the component mounts
  useEffect(() => {
    async function initializeThread() {
      try {
        const newThreadId = await createThread();
        setThreadId(newThreadId);
      } catch (error) {
        console.error('Failed to create thread:', error);
      }
    }
    
    if (!threadId) {
      initializeThread();
    }
  }, [threadId]);

  // Request notification permissions when component mounts
  useEffect(() => {
    // Check if the browser supports notifications
    if ('Notification' in window) {
      // Don't ask for permission immediately, wait for a user interaction
      if (Notification.permission === 'default') {
        const handleUserInteraction = () => {
          Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
          }).catch(error => {
            console.error('Error requesting notification permission:', error);
          });
          
          // Remove the event listeners after we've requested permission
          window.removeEventListener('click', handleUserInteraction);
          window.removeEventListener('keydown', handleUserInteraction);
          window.removeEventListener('touchstart', handleUserInteraction);
        };
        
        window.addEventListener('click', handleUserInteraction);
        window.addEventListener('keydown', handleUserInteraction);
        window.addEventListener('touchstart', handleUserInteraction);
        
        return () => {
          window.removeEventListener('click', handleUserInteraction);
          window.removeEventListener('keydown', handleUserInteraction);
          window.removeEventListener('touchstart', handleUserInteraction);
        };
      }
    }
  }, []);

  // Preload notification sound
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      // Use absolute path to ensure sound loads correctly
      const audio = new Audio('/sounds/notification.mp3');
      audio.preload = 'auto';
      
      // Try to load the sound in advance
      const preloadSound = () => {
        audio.load();
        console.log('Preloading notification sound');
      };
      
      // Add error handling
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
      });
      
      // Add success handling
      audio.addEventListener('canplaythrough', () => {
        console.log('Notification sound loaded successfully');
      });
      
      audioRef.current = audio;
      
      // Try to preload after a short delay to ensure browser is ready
      const timer = setTimeout(preloadSound, 2000);
      
      return () => {
        clearTimeout(timer);
        if (audioRef.current) {
          audioRef.current.removeEventListener('error', () => {});
          audioRef.current.removeEventListener('canplaythrough', () => {});
          audioRef.current = null;
        }
      };
    }
  }, []);

  // Function to play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      
      // Reset the audio to the beginning before playing
      audioRef.current.currentTime = 0;
      
      // Try to play the sound, but don't worry if it fails due to browser restrictions
      audioRef.current.play().catch(error => {
        console.log('Could not play notification sound:', error);
        
        // If sound fails and notifications are allowed, show a notification instead
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Osprey Labs Assistant', {
            body: 'Chat assistant is ready to help you',
            icon: '/favicon.svg'
          });
        }
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !threadId) return;
    
    const message = inputValue.trim();
    
    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: message,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Create a placeholder for the assistant's response with typing animation
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: '' }
      ]);
      
      // Send the message to the API and get streaming response
      const initialResponse = await sendMessageAndGetResponse(threadId, message);
      
      // Start with empty content then simulate streaming
      let displayedContent = '';
      
      // Simulate typing by adding words one by one
      const words = initialResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        displayedContent += (i > 0 ? ' ' : '') + words[i];
        
        setMessages((prev) => {
          const newMessages = [...prev];
          // Update the last message (assistant's response)
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
            newMessages[newMessages.length - 1].content = displayedContent;
          }
          return newMessages;
        });
        
        // Random delay between 50-150ms to simulate typing
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      }
      
      // Log the completed conversation
      await logChatMessage(threadId, message, initialResponse);
      
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again later.",
        },
      ]);
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* CSS for typing indicator animation */}
      <style jsx global>{`
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .typing-indicator span {
          display: block;
          width: 8px;
          height: 8px;
          background-color: #94a3b8;
          border-radius: 50%;
          opacity: 0.6;
        }
        
        .typing-indicator span:nth-child(1) {
          animation: typing 1s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation: typing 1s infinite 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation: typing 1s infinite 0.4s;
        }
        
        @keyframes typing {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
      `}</style>

      {/* Initial attention-grabbing animation */}
      <AnimatePresence>
        {showInitialAnimation && !isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0, bottom: '2rem', right: '2rem' }}
            animate={{ opacity: 1, scale: [0, 1.2, 1], bottom: '8rem', right: '2rem' }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed z-50 bg-white p-4 rounded-lg shadow-lg max-w-xs"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-primary-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">{getTimeBasedGreeting()}!</p>
                <p className="text-sm text-gray-600 mt-1">I'm Theo, the Osprey Labs AI assistant. Can I help you with anything?</p>
              </div>
            </div>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${hasAutoOpened && !isOpen ? 'animate-pulse' : ''}`}
          aria-label="Open chat assistant"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {hasAutoOpened && !isOpen && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-secondary-500"></span>
                </span>
              )}
            </>
          )}
        </button>
      </div>
      
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 right-8 z-50 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 150px)' }}
          >
            {/* Chat header */}
            <div className="p-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Osprey Labs Assistant</h3>
                  <p className="text-xs text-white/70">Theo | How can I help you today?</p>
                </div>
              </div>
            </div>
            
            {/* Empty state if no messages */}
            {messages.length === 0 && !isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50"
              >
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </motion.div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">{getTimeBasedGreeting()}!</h4>
                <p className="text-gray-600 mb-6">I'm Theo, the Osprey Labs AI assistant. How can I help you today?</p>
                <motion.div
                  initial={{ opacity: 0.5, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 1.5
                  }}
                >
                  <p className="text-sm text-primary-600">Ask me anything about our services...</p>
                </motion.div>
              </motion.div>
            )}
            
            {/* Chat messages */}
            {(messages.length > 0 || isTyping) && (
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index === messages.length - 1 ? 0 : 0,
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        {message.content ? (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        ) : message.role === 'assistant' ? (
                          // Animated typing indicator for empty assistant messages
                          <div className="flex items-center h-6">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[80%] rounded-lg p-3 bg-white text-gray-800 border border-gray-200 shadow-sm">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
            
            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  id="chat-input"
                  type="text"
                  className="flex-1 input py-2"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={!threadId || isTyping}
                />
                <button
                  type="submit"
                  className="btn btn-primary p-2"
                  disabled={!inputValue.trim() || !threadId || isTyping}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ask about our services, pricing, or how we can help your business
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 