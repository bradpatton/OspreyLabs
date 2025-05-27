import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ASSISTANT_PROMPT } from '@/utils/openai';
import ChatLogsService from '@/lib/services/chatLogs';

// Force this route to be dynamic (not pre-rendered during build)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy initialization of OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

// Create or get an assistant
async function getOrCreateAssistant() {
  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  const openai = getOpenAIClient();
  
  // If we have an assistant ID, use it
  if (assistantId) {
    try {
      const existingAssistant = await openai.beta.assistants.retrieve(assistantId);
      return existingAssistant.id;
    } catch (error) {
      console.error('Error retrieving assistant, will create a new one:', error);
    }
  }
  
  // Otherwise create a new assistant
  try {
    const assistant = await openai.beta.assistants.create({
      name: "Osprey Labs Assistant",
      instructions: ASSISTANT_PROMPT,
      model: "gpt-4-turbo-preview",
    });
    
    console.log('Created new assistant with ID:', assistant.id);
    return assistant.id;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
}

// API route handler for creating a thread
export async function POST(request: Request) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const openai = getOpenAIClient();
    
    // Ensure we have the assistant ID
    const assistantId = await getOrCreateAssistant();
    
    // Create a new thread
    const thread = await openai.beta.threads.create();
    
    return NextResponse.json({ 
      threadId: thread.id,
      assistantId 
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}

// API route for sending a message and getting a response
export async function PUT(request: Request) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const openai = getOpenAIClient();
    const { threadId, message } = await request.json();
    
    if (!threadId || !message) {
      return NextResponse.json(
        { error: 'threadId and message are required' },
        { status: 400 }
      );
    }
    
    // Add the user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });
    
    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID as string
    });
    
    // Poll for the result (simplified for the example)
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    let attempts = 0;
    const maxAttempts = 30; // Prevent infinite loops
    
    while (
      runStatus.status !== 'completed' && 
      runStatus.status !== 'failed' && 
      runStatus.status !== 'cancelled' && 
      runStatus.status !== 'expired' && 
      attempts < maxAttempts
    ) {
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      attempts++;
    }
    
    // Get the assistant's response
    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId);
      
      // The first message should be the most recent (the assistant's response)
      const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length > 0) {
        // Get the latest assistant message
        const latestMessage = assistantMessages[0];
        
        // Extract content
        let responseText = '';
        
        if (latestMessage.content && latestMessage.content.length > 0) {
          for (const content of latestMessage.content) {
            if (content.type === 'text') {
              responseText += content.text.value;
            }
          }
        }
        
        // Log the conversation to the database
        try {
          const userAgent = request.headers.get('user-agent') || undefined;
          const forwarded = request.headers.get('x-forwarded-for');
          const ipAddress = forwarded ? forwarded.split(',')[0] : 
                           request.headers.get('x-real-ip') || 
                           '127.0.0.1';

          await ChatLogsService.createChatLog(
            threadId,
            message,
            responseText,
            ipAddress,
            userAgent
          );
        } catch (logError) {
          console.error('Error logging chat conversation:', logError);
          // Don't fail the request if logging fails
        }
        
        return NextResponse.json({ response: responseText });
      }
    }
    
    // If we reached here, something went wrong
    return NextResponse.json(
      { error: `Assistant run ended with status: ${runStatus.status}` },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 