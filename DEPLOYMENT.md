# Osprey Labs Website Deployment Instructions

Complete instructions for deploying the Osprey Labs website application to production with PostgreSQL database backend.

## Architecture Overview

The application now uses:
- **Next.js 14** for the web application
- **PostgreSQL 15** for data persistence
- **Docker & Docker Compose** for containerization
- **Database-based authentication** (no more file-based storage)
Hello
## Prerequisites

- Docker 20.x or later
- Docker Compose 2.x or later
- Git
- OpenSSL (for generating secrets)
- curl (for health checks)

## Quick Start (Production)

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd osprey_page
   ```

2. **Setup secrets:**
   ```bash
   chmod +x scripts/setup-secrets.sh
   ./scripts/setup-secrets.sh
   ```

3. **Create production environment:**
   ```bash
   cp env.template .env.production
   # Edit .env.production with your production values
   ```

4. **Deploy:**
   ```bash
   chmod +x scripts/deploy-production.sh
   ./scripts/deploy-production.sh
   ```

## Detailed Setup Instructions

### 1. Environment Configuration

Create `.env.production` with these variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database Configuration (Production)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=osprey_labs
DB_USER=osprey_user
DB_PASSWORD=your-secure-production-password

# Application Configuration
NODE_ENV=production
NEXTAUTH_SECRET=your-generated-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
```

### 2. Security Setup

**Generate secure passwords:**
```bash
# Generate a secure database password
openssl rand -base64 32

# Generate NextAuth secret (done automatically by setup-secrets.sh)
openssl rand -base64 32
```

**Update default admin credentials:**
After deployment, immediately:
1. Go to `http://your-domain/admin`
2. Login with `admin` / `admin123`
3. Change the password in the admin panel

### 3. Database Architecture

The application includes these database tables:
- **admin_users**: User accounts with bcrypt password hashing
- **admin_sessions**: Session management with tokens
- **articles**: Blog articles and content management
- **contact_submissions**: Contact form submissions
- **job_applications**: Job application data
- **chat_logs**: AI assistant conversation logs

All data is automatically initialized on first startup.

## Deployment Options

### Option 1: Docker Production Deployment (Recommended)

**Single command deployment:**
```bash
./scripts/deploy-production.sh
```

**Manual deployment:**
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 2: Development Environment

```bash
# Start development environment
docker-compose up -d

# The app will be available on http://localhost:3000
# Database will be on port 5434 (to avoid conflicts)
```

### Option 3: Cloud Platform Deployment

For platforms like AWS, GCP, or Azure:

1. **Build the Docker image:**
   ```bash
   docker build -t osprey-labs .
   ```

2. **Push to your container registry:**
   ```bash
   docker tag osprey-labs your-registry/osprey-labs:latest
   docker push your-registry/osprey-labs:latest
   ```

3. **Deploy with your cloud provider's container service**

4. **Set up managed PostgreSQL database**

5. **Configure environment variables in your cloud platform**

## Health Monitoring

The application includes comprehensive health checks:

**Health endpoint:** `GET /api/health`

Response format:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

**Docker health checks:**
- Web application: HTTP check on `/api/health`
- PostgreSQL: `pg_isready` command
- Automatic restart on failure

## Database Management

### Backup Database
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U osprey_user osprey_labs > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U osprey_user -d osprey_labs < backup.sql
```

### Access Database
```bash
# Connect to database
docker-compose -f docker-compose.prod.yml exec postgres psql -U osprey_user -d osprey_labs

# View tables
\dt

# View admin users
SELECT username, email, role, created_at FROM admin_users;
```

### Reset Admin Password
```bash
# Connect to database and run:
UPDATE admin_users 
SET password_hash = '$2b$12$FUnAHWm3NWmH7M5AS0Bhnu4DtuUbgBHD4p2hs6KG6URoPYjsn/b6W' 
WHERE username = 'admin';
# This resets password to 'admin123'
```

## Monitoring and Maintenance

### View Application Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Database performance
docker-compose -f docker-compose.prod.yml exec postgres psql -U osprey_user -d osprey_labs -c "
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables;
"
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Check health
curl http://localhost/api/health
```

## Troubleshooting

### Common Issues

**Database connection failed:**
```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U osprey_user -d osprey_labs

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

**Application won't start:**
```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs web

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec web env | grep -E "(DB_|OPENAI_|NEXTAUTH_)"
```

**Health check failing:**
```bash
# Test health endpoint manually
curl -v http://localhost/api/health

# Check if database is accessible from web container
docker-compose -f docker-compose.prod.yml exec web nc -zv postgres 5432
```

### Recovery Procedures

**Complete reset:**
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: This deletes all data)
docker-compose -f docker-compose.prod.yml down -v

# Restart fresh
docker-compose -f docker-compose.prod.yml up -d --build
```

**Database only reset:**
```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Remove only database volume
docker volume rm osprey_page_postgres_data

# Restart (database will reinitialize)
docker-compose -f docker-compose.prod.yml up -d
```

## Security Considerations

### Production Security Checklist

- [ ] Change default admin password
- [ ] Use strong database passwords
- [ ] Set secure NEXTAUTH_SECRET
- [ ] Configure HTTPS/SSL termination
- [ ] Set up firewall rules
- [ ] Enable database connection encryption
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup encryption

### Network Security
```bash
# The application uses internal Docker networks
# Only expose necessary ports:
# - Port 80/443: Web application
# - Port 5432: Database (only if external access needed)
```

## API Endpoints

The application exposes these endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/login` - Admin authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/articles` - Article management
- `POST /api/contact` - Contact form submissions
- `POST /api/jobs` - Job applications
- `GET /api/chat-logs` - Chat conversation logs
- `GET /api/admin/stats` - Admin dashboard statistics

## Performance Optimization

### Production Optimizations

- **Next.js standalone build** for minimal container size
- **PostgreSQL connection pooling** for database efficiency
- **Health checks** for automatic recovery
- **Multi-stage Docker builds** for optimized images
- **Volume persistence** for data durability

### Scaling Considerations

For high-traffic deployments:
- Use managed PostgreSQL service (AWS RDS, Google Cloud SQL)
- Implement Redis for session storage
- Set up load balancer for multiple web instances
- Configure CDN for static assets
- Monitor with APM tools (New Relic, DataDog)

## Support and Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check application logs for errors
- Verify backup integrity
- Monitor disk usage

**Monthly:**
- Update dependencies
- Review security logs
- Performance optimization review

**Quarterly:**
- Security audit
- Database optimization
- Disaster recovery testing

### Getting Help

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Test database connectivity

The application is designed for reliable production deployment with comprehensive monitoring and recovery capabilities. 