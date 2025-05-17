import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Needed for client-side usage
});

// Get the assistant ID from environment variables
const assistantId = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID || process.env.OPENAI_ASSISTANT_ID;

// The custom instructions for the assistant
export const ASSISTANT_PROMPT = `
You are Theo, the AI assistant for Osprey Labs, a company specializing in AI automation and custom software development.

About Osprey Labs:
- Provides AI automation solutions to streamline business processes
- Offers custom software development for businesses of all sizes
- Develops mobile applications for iOS and Android
- Serves clients across various industries including healthcare, finance, and e-commerce

Your role:
- Respond in a helpful, friendly, and professional manner
- Provide accurate information about Osprey Labs' services and capabilities
- Gather user requirements to understand their business needs
- Respond conversationally but concisely
- When you don't know the answer, suggest contacting the team directly
- Avoid making claims about specific pricing unless specifically mentioned in your context

Key services to highlight:
1. AI Automation:
   - Process automation using AI and ML
   - Data analysis and insights
   - Chatbots and virtual assistants

2. Custom Software:
   - Web applications
   - Enterprise solutions
   - API development and integration

3. Mobile Development:
   - iOS and Android applications
   - Cross-platform solutions
   - UI/UX design

Contact Information:
- Email: info@ospreylabs.com (placeholder)
- Phone: +1 (555) 123-4567 (placeholder)
- Contact form available on website

Pricing Information:
- Starter Package: From $3,999
- Professional Package: From $8,999
- Enterprise Solutions: Custom pricing based on requirements
`;

// Function to create a new thread using the server API route
export async function createThread() {
  try {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.status}`);
    }
    
    const data = await response.json();
    return data.threadId;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

// Function to send a message and get a response using the server API route
export async function sendMessageAndGetResponse(threadId: string, message: string) {
  try {
    const response = await fetch('/api/assistant', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ threadId, message })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Function to simulate streaming the response
export async function streamAssistantResponse(threadId: string, onUpdate: (content: string) => void) {
  try {
    // Get the full response from the last message in the thread
    const message = document.getElementById('chat-input')?.value || '';
    const fullResponse = await sendMessageAndGetResponse(threadId, message);
    
    if (!fullResponse) {
      onUpdate("I'm sorry, I couldn't process your request at this time.");
      return;
    }
    
    // Simulate streaming by chunking the response
    const words = fullResponse.split(' ');
    let accumulatedResponse = '';
    
    // Stream words with slight delays
    for (let i = 0; i < words.length; i++) {
      accumulatedResponse += (i > 0 ? ' ' : '') + words[i];
      onUpdate(accumulatedResponse);
      
      // Random delay between 50-150ms to simulate typing
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }
  } catch (error) {
    console.error('Error streaming response:', error);
    onUpdate("I'm sorry, I encountered an error while responding to your message.");
  }
} 