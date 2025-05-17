# Osprey Labs Website

This is the official website for Osprey Labs, featuring a landing page and an AI assistant.

## Features

- Modern responsive design
- AI chatbot assistant using OpenAI API
- Chat logging system for review and analysis

## Chat Logging System

The website includes a system to log all conversations with the AI assistant for review. Here's how it works:

### How Logging Works

1. Every message sent by users and responses from the AI assistant are logged
2. Logs include:
   - Unique thread ID for each conversation
   - Timestamp
   - User message content
   - Assistant response content
   - User's browser info (user agent)
   - IP address (if available)

### Accessing Logs

1. Visit `/admin/chat-logs` in your browser
2. Enter your admin API key (set in the `.env.local` file)
3. View and analyze conversation logs grouped by thread
4. Expand any thread to see the full conversation
5. Export individual threads as JSON files

### Programmatic Access

You can also access chat logs programmatically via the API:

1. API documentation is available at `/admin/api-docs`
2. Use your admin API key for authentication
3. Filter logs by thread ID, date range, and more
4. Retrieve logs in raw format or grouped by thread

Example API request:
```
GET /api/chat-logs?format=grouped&startDate=2023-01-01T00:00:00Z
Authorization: Bearer your_admin_api_key
```

### Security

- Logs are stored server-side
- Admin API key is required to access the logs
- Middleware protection for admin routes

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_assistant_id
ADMIN_API_KEY=your_admin_key_for_accessing_logs
```

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. 