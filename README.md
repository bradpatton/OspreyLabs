# Osprey Labs Website

A modern business website with AI automation services, built with Next.js and PostgreSQL.

## 🚀 Features

- **Modern Responsive Design**: Beautiful, mobile-first UI with Tailwind CSS
- **AI Assistant**: OpenAI-powered chatbot for customer inquiries
- **PostgreSQL Database**: Robust data persistence for all content and user data
- **Admin Dashboard**: Complete content management system
- **Article Management**: Full blog/article system with markdown support
- **Contact Management**: Lead capture and management system
- **Job Applications**: Career page with application tracking
- **Docker Deployment**: Production-ready containerized deployment

## 🏗️ Architecture

### Database (PostgreSQL)
- **Articles**: Blog posts and content management
- **Admin Users**: User authentication and session management
- **Contact Submissions**: Lead capture and tracking
- **Job Applications**: Career applications management
- **Chat Logs**: AI assistant conversation logging

### Authentication
- Database-based user authentication with bcrypt password hashing
- Session-based authentication with secure tokens
- API key authentication for admin access
- Role-based access control (admin, super_admin)

### API Endpoints
- `/api/articles` - Article CRUD operations
- `/api/auth/*` - Authentication endpoints
- `/api/contact` - Contact form submissions
- `/api/jobs` - Job application management
- `/api/chat-logs` - AI conversation logging
- `/api/admin/stats` - Dashboard statistics
- `/api/health` - Health check for monitoring

## 🛠️ Development Setup

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (via Docker)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd osprey_page
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start PostgreSQL database**
   ```bash
   docker compose up postgres -d
   ```

4. **Set up environment variables**
   ```bash
   cp env.template .env.local
   # Edit .env.local with your configuration
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin
   - Default admin: username `admin`, password `admin123`

## 🐳 Production Deployment

### Docker Deployment

1. **Create production environment**
   ```bash
   cp env.production.template .env.production
   # Update with your production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

3. **Access production application**
   - Website: http://localhost
   - PostgreSQL: localhost:5435

### Environment Variables

#### Required Variables
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
DB_HOST=localhost          # Use 'postgres' for Docker
DB_PORT=5434              # Use 5432 for Docker internal
DB_NAME=osprey_labs
DB_USER=osprey_user
DB_PASSWORD=your_secure_password

# Application Configuration
NODE_ENV=development      # or 'production'
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 📊 Admin Dashboard

### Accessing Admin Panel
1. Navigate to `/admin`
2. Login with username/password or API key
3. Access various management sections:
   - **Articles**: Create, edit, and manage blog posts
   - **Contacts**: View and manage contact submissions
   - **Jobs**: Review job applications
   - **Chat Logs**: Monitor AI assistant conversations
   - **Statistics**: View dashboard metrics

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **API Key**: `osprey-admin-2024-secure-key`

⚠️ **Security Note**: Change the default admin password in production!

## 🗄️ Database Schema

### Key Tables
- `admin_users` - User accounts and authentication
- `admin_sessions` - Session management
- `articles` - Blog posts and content
- `contact_submissions` - Contact form data
- `job_applications` - Career applications
- `chat_logs` - AI conversation history

### Database Management
```bash
# Access PostgreSQL directly
docker exec -it osprey_postgres psql -U osprey_user -d osprey_labs

# View tables
\dt

# Backup database
docker exec osprey_postgres pg_dump -U osprey_user osprey_labs > backup.sql
```

## 🔧 API Documentation

### Authentication
Most admin endpoints require authentication via:
- Session token (from login)
- API key in headers: `x-admin-key: your_api_key`

### Example API Calls
```bash
# Get all articles
curl http://localhost:3000/api/articles

# Admin login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Create article (requires auth)
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "x-admin-key: osprey-admin-2024-secure-key" \
  -d '{"title":"New Article","content":"Article content..."}'
```

## 🚀 Deployment Scripts

### Available Scripts
- `scripts/setup-secrets.sh` - Generate secure secrets
- `scripts/deploy-production.sh` - Automated production deployment
- `scripts/backup-database.sh` - Database backup utility

### Health Monitoring
The application includes health checks:
- Docker health checks for containers
- `/api/health` endpoint for monitoring
- Database connection verification

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure token-based sessions
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Configured for production
- **Environment Isolation**: Separate dev/prod configurations
- **Non-root Container**: Docker security best practices

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (dev and production)
5. Submit a pull request

## 📄 License

This project is proprietary to Osprey Labs.

---

For support or questions, contact: brad@ospreylaboratories.com 