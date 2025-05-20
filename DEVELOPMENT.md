# Osprey Labs Website Development Documentation

This document provides detailed technical information for developers working on the Osprey Labs website project.

## Project Overview

The Osprey Labs website is built using:
- Next.js 14.x
- React 18.x
- Tailwind CSS
- Framer Motion for animations
- OpenAI API for the chat assistant

## Development Environment Setup

1. Ensure you have Node.js 18+ installed:
   ```bash
   node --version
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key
   OPENAI_ASSISTANT_ID=asst_your-assistant-id
   ADMIN_API_KEY=your-admin-secret-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on port 3000 by default, falling back to other ports (3001, 3002) if already in use.

## Project Structure

```
osprey_page/
├── public/                 # Static assets
│   ├── images/             # Image files
│   └── sounds/             # Audio files (notification sounds, etc.)
├── src/                    # Source code
│   ├── app/                # Next.js App Router structure
│   │   ├── admin/          # Admin dashboards and protected routes
│   │   ├── api/            # API routes
│   │   │   ├── assistant/  # OpenAI assistant integration
│   │   │   ├── chat-logs/  # Chat logging endpoints
│   │   │   ├── contact/    # Contact form submission handling
│   │   │   └── careers/    # Career applications handling
│   │   ├── careers/        # Careers page and application form
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable React components
│   │   ├── ChatAssistant.tsx  # AI chat functionality
│   │   ├── CTA.tsx         # Call to action components
│   │   ├── Features.tsx    # Features showcase
│   │   ├── Footer.tsx      # Site footer
│   │   ├── Header.tsx      # Site header/navigation
│   │   ├── Hero.tsx        # Hero section
│   │   └── Services.tsx    # Services section
│   ├── utils/              # Utility functions
│   │   └── openai.ts       # OpenAI integration utilities
│   └── styles/             # Global styles
└── logs/                   # Server-side logs storage
    ├── contact-submissions.json  # Contact form submissions
    └── chat-logs.json      # AI chat conversation logs
```

## Key Components

### ChatAssistant.tsx

The AI chat assistant component that:
- Connects to OpenAI's API via assistants
- Auto-opens after 25 seconds
- Shows animated typing indicators
- Includes sound notifications
- Logs all conversation data

Implementation details:
- Uses React's useEffect for initialization and cleanup
- Uses Framer Motion for animations
- Implements a unified welcome message

### API Routes

1. **assistant/** - Handles OpenAI communication:
   - Creates threads for conversation management
   - Sends messages and receives responses
   - Manages streaming text responses

2. **chat-logs/** - Records all chat interactions:
   - Saves messages with timestamps and metadata
   - Provides endpoints for admin review

3. **contact/** - Processes contact form submissions:
   - Validates user input
   - Saves submissions to JSON file
   - Includes test endpoint at `/api/contact/test`

4. **careers/** - Handles job applications:
   - Processes application form submissions
   - Stores application data

## Common Development Issues and Solutions

### Image Path Configuration

Next.js requires images in the `/public` directory to be referenced without the `/public/` prefix:

```jsx
// Incorrect
<img src="/public/images/example.jpg" />

// Correct
<img src="/images/example.jpg" />
```

Error evidence from logs:
```
GET /public/images/business-automation.jpg 404 in 866ms
GET /public/images/Process_automation.jpg 404 in 644ms
```

### Sound File Issues

1. When implementing sound playback:
   - Ensure sounds are in the correct location
   - Handle browser autoplay restrictions
   - Use proper error handling

Error evidence from logs:
```
GET /sounds/notification.mp3 416 in 500ms
```

2. Solution:
   - Preload audio files
   - Implement user interaction requirements
   - Provide fallback notification options

### Component Syntax Errors

Watch for these common syntax issues:
- Missing export statements
- Incorrect JSX structure
- Unclosed tags or parentheses

Error evidence from logs:
```
⨯ ./src/components/Footer.tsx
Error: Unexpected token `footer`. Expected jsx identifier
```

## Development Workflow Tips

1. **Component Development**:
   - Create components in isolation first
   - Test thoroughly before integration
   - Use Framer Motion for animations consistently

2. **API Testing**:
   - Use the `/api/contact/test` page for testing form submissions
   - Monitor server logs for API response times and errors
   - Test with various inputs to ensure validation works

3. **Responsive Design**:
   - Test all components at multiple viewport sizes
   - Use Tailwind's responsive prefixes consistently
   - Maintain a mobile-first approach

4. **Performance Optimization**:
   - Use Next.js Image component for optimized images
   - Implement lazy loading where appropriate
   - Monitor build output for large bundles

## OpenAI Assistant Integration

1. **Thread Management**:
   - Each chat session creates a unique thread
   - Threads persist throughout the session
   - Messages are added to the thread sequentially

2. **Response Streaming**:
   - Responses simulate typing with word-by-word display
   - Animation timing is carefully controlled
   - Typing indicators show during processing

3. **Logging System**:
   - All conversations are logged with metadata
   - Logs include timestamps, user agent info, and IP
   - Protected admin interface for reviewing logs

## Local Development Performance

Based on the development logs:
- Average API response time: 1-3 seconds
- Build compilation time: 300-900ms for most files
- API routes compilation: 500-900ms

## Troubleshooting

If you encounter any issues, refer to the DEPLOYMENT.md file for common troubleshooting steps or review the server logs for specific error messages.

For more information, contact the project maintainers. 