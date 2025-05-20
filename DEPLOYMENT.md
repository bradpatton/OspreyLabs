# Osprey Labs Website Deployment Instructions

Below are complete instructions for deploying the Osprey Labs website application to production, including all necessary configuration steps and requirements.

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Git
- A Vercel, Netlify, or similar hosting account
- An OpenAI API key for the assistant functionality

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd osprey_page
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables file:
   ```bash
   touch .env.local
   ```

4. Add the following environment variables to `.env.local`:
   ```
   # OpenAI API key for the assistant functionality
   OPENAI_API_KEY=sk-your-openai-api-key
   
   # Admin API key for protected routes
   ADMIN_API_KEY=your-admin-secret-key
   
   # Assistant ID from OpenAI
   OPENAI_ASSISTANT_ID=asst_your-assistant-id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Directory Structure Setup

Ensure these directories exist for proper application functionality:

```bash
# Create logs directory for contact form submissions and chat logs
mkdir -p logs

# Create public directories for media assets
mkdir -p public/images
mkdir -p public/sounds

# Set correct permissions
chmod 755 logs
chmod 755 public/images
chmod 755 public/sounds
```

## Production Deployment

### Option 1: Vercel Deployment (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your project to Vercel:
   ```bash
   vercel login
   vercel link
   ```

3. Add environment variables to Vercel:
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add ADMIN_API_KEY
   vercel env add OPENAI_ASSISTANT_ID
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option 2: Self-Hosted Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. For a more robust setup, use PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "osprey-labs" -- start
   pm2 save
   pm2 startup
   ```

## Configuration Details

### OpenAI Assistant Configuration

1. Create an assistant in the OpenAI dashboard with these instructions:
   ```
   You are Theo, the Osprey Labs AI assistant. Be helpful, concise, and friendly while answering questions about the company's services.
   
   Key information to remember:
   - Osprey Labs provides AI Automation, Custom Software Development, and Mobile App Development services
   - Pricing starts at $3,999 for starter packages and $8,999 for professional packages
   - Contact email: info@ospreylabs.com
   - Phone: [Company Phone]
   - Office location: 410 E. Beach Drive, Panama City, FL 32401
   
   When asked about specific services, provide concrete examples and benefits. Always maintain a professional yet conversational tone.
   ```

2. Add knowledge files to your assistant if needed for more detailed responses.

3. Save your Assistant ID and add it to your environment variables.

### File System Requirements

Ensure these files have the correct permissions for production:

```bash
# Create and set permissions for contact submissions file
touch logs/contact-submissions.json
chmod 644 logs/contact-submissions.json

# Create and set permissions for chat logs file
touch logs/chat-logs.json
chmod 644 logs/chat-logs.json

# Add notification sound for chat popup
curl -o public/sounds/notification.mp3 https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3
chmod 644 public/sounds/notification.mp3
```

## Known Issues and Troubleshooting

Based on the development logs, watch for these common issues:

### Image Path Issues
- Images in `/public` directory should be referenced without the `/public/` prefix in the code.
- Example error observed: `GET /public/images/business-automation.jpg 404`
- Fix by updating image paths from `/public/images/file.jpg` to `/images/file.jpg`

### Notification Sound Not Found
- Error observed: `GET /sounds/notification.mp3 416`
- Ensure the notification sound file exists at the correct path
- Run: `curl -o public/sounds/notification.mp3 https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3`

### Syntax Errors in Components
- Watch for unexpected token errors in components like Footer.tsx
- These usually indicate missing export statements or syntax issues

### API Connection Issues
- If the chat assistant fails to connect, check your OPENAI_API_KEY and OPENAI_ASSISTANT_ID.
- Verify the API key has sufficient permissions and quota.
- Check API response logs for troubleshooting

## Post-Deployment Verification

After deployment, verify these critical components:

1. **Chat Assistant:** Check that the chat assistant loads, opens automatically after 25 seconds, and properly connects to the OpenAI API.

2. **Contact Form:** Test the contact form to ensure submissions are saved properly to `logs/contact-submissions.json`.

3. **Image Loading:** Verify all images load correctly, especially service images from the `/public/images/` directory.

4. **Sound Files:** Test that notification sounds play when the chat window opens automatically.

## Maintenance and Updates

1. Regularly backup the logs directory containing user submissions.

2. Update dependencies with:
   ```bash
   npm outdated
   npm update
   ```

3. For major updates, test thoroughly in a staging environment before deploying to production.

## Development Port Configuration

The application will attempt to use port 3000 by default, falling back to other ports (3001, 3002, etc.) if these are already in use.

## API Endpoints

The application exposes these API endpoints:

- `/api/assistant` - Handles chat assistant communication with OpenAI
- `/api/chat-logs` - Logs chat interactions
- `/api/contact` - Processes contact form submissions
- `/api/careers` - Handles career applications

## Performance Considerations

- The build process may take several minutes to complete
- Average API response time for the assistant is 1-3 seconds
- Initial page load time should be under 800ms for optimal performance 