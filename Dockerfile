# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including sharp for image optimization
RUN npm ci && npm install sharp

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install necessary packages for production
RUN apk add --no-cache \
    wget \
    postgresql-client

# Install sharp for Next.js image optimization in production
RUN npm install sharp

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Database environment variables (will be overridden by docker-compose)
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_NAME=osprey_labs
ENV DB_USER=osprey_user

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create necessary directories
RUN mkdir -p logs/resumes

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check to ensure the application is running and can connect to database
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 