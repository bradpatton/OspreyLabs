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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi there! 👋 I\'m the Osprey Labs AI assistant, Theo. How can I help you today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const companyInfo = {
    'services': 'We offer AI Automation, Custom Software Development, and Mobile App Development services. Our AI solutions help automate business processes, our custom software is tailored to your specific needs, and our mobile apps are built for both iOS and Android platforms.',
    'pricing': 'Our pricing starts at $3,999 for the Starter package, $8,999 for the Professional package, and we offer custom pricing for Enterprise solutions. Contact us for a detailed quote based on your specific requirements.',
    'about': 'Osprey Labs is a leading AI automation and custom development company. We specialize in building intelligent solutions that help businesses streamline operations, reduce costs, and drive growth.',
    'contact': 'You can reach us at info@ospreylabs.com or call us at +1 (555) 123-4567. Alternatively, fill out the contact form on our website, and we\'ll get back to you within 24 hours.',
    'location': 'Our main office is located at 123 Innovation Drive, Tech City, CA 94123. We also work remotely with clients worldwide.',
  };

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getResponse = async (userMessage: string) => {
    // Simulate API call to get response
    setIsTyping(true);
    
    // Wait for 1-2 seconds to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    let response = 'I\'m not sure how to help with that. Could you try asking something about our services, pricing, or contact information?';
    
    // Simple keyword-based responses
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) {
      response = 'Hello! How can I assist you today?';
    } else if (lowercaseMessage.includes('service')) {
      response = companyInfo.services;
    } else if (lowercaseMessage.includes('pricing') || lowercaseMessage.includes('cost') || lowercaseMessage.includes('price')) {
      response = companyInfo.pricing;
    } else if (lowercaseMessage.includes('about') || lowercaseMessage.includes('company')) {
      response = companyInfo.about;
    } else if (lowercaseMessage.includes('contact') || lowercaseMessage.includes('email') || lowercaseMessage.includes('phone')) {
      response = companyInfo.contact;
    } else if (lowercaseMessage.includes('location') || lowercaseMessage.includes('address') || lowercaseMessage.includes('office')) {
      response = companyInfo.location;
    } else if (lowercaseMessage.includes('ai') || lowercaseMessage.includes('automation')) {
      response = 'Our AI automation solutions help businesses streamline processes, reduce manual work, and increase efficiency. We build custom AI tools that integrate with your existing systems.';
    } else if (lowercaseMessage.includes('mobile') || lowercaseMessage.includes('app')) {
      response = 'We develop high-quality mobile applications for both iOS and Android platforms. Our apps are designed with a focus on user experience and performance.';
    } else if (lowercaseMessage.includes('custom') || lowercaseMessage.includes('software')) {
      response = 'Our custom software development services are tailored to your specific business needs. We build scalable, secure, and maintainable solutions using modern technologies.';
    } else if (lowercaseMessage.includes('thank')) {
      response = 'You\'re welcome! Is there anything else I can help you with?';
    } else if (lowercaseMessage.includes('bye') || lowercaseMessage.includes('goodbye')) {
      response = 'Goodbye! Feel free to reach out if you have any more questions.';
    }
    
    setIsTyping(false);
    return response;
  };

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
      // Create a placeholder for the assistant's response
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
      {/* Chat button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label="Open chat assistant"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
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
                  <p className="text-xs text-white/70">Online | Ask me anything</p>
                </div>
              </div>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-white text-gray-800 border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
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