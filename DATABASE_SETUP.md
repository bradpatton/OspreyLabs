# PostgreSQL Database Setup Guide

This guide explains how to set up and run the PostgreSQL database for the Osprey Labs application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Node.js 18+ for the application
- Git for version control

## Quick Start

1. **Clone and navigate to the project directory**
   ```bash
   cd /path/to/osprey_page
   ```

2. **Start the PostgreSQL database**
   ```bash
   docker-compose up postgres -d
   ```

3. **Wait for database initialization**
   ```bash
   # Check if database is ready
   docker-compose logs postgres
   ```

4. **Copy environment variables**
   ```bash
   cp env.template .env.local
   ```

5. **Install dependencies and start the application**
   ```bash
   npm install
   npm run dev
   ```

6. **Access the admin panel**
   - Navigate to `http://localhost:3000/admin`
   - Login with: `admin` / `admin123`

## Detailed Setup Instructions

### 1. Database Container Setup

The PostgreSQL database runs in a Docker container with the following configuration:

- **Image**: `postgres:15-alpine`
- **Database**: `osprey_labs`
- **Username**: `osprey_user`
- **Password**: `osprey_secure_password_2024`
- **Port**: `5432` (mapped to host)

### 2. Starting the Database

```bash
# Start only the PostgreSQL service
docker-compose up postgres -d

# Or start all services (if you have other services defined)
docker-compose up -d
```

### 3. Database Initialization

The database automatically initializes with:

- **Schema creation** (`database/init/01-create-tables.sql`)
- **Seed data** (`database/init/02-seed-data.sql`)

Initial data includes:
- Default admin user (`admin` / `admin123`)
- Sample articles
- Sample contact submissions
- Sample job applications
- Sample chat logs

### 4. Environment Configuration

Create `.env.local` file with database configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=osprey_labs
DB_USER=osprey_user
DB_PASSWORD=osprey_secure_password_2024

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Application Configuration
NODE_ENV=development
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 5. Application Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Database Management

### Connecting to the Database

```bash
# Using Docker exec
docker-compose exec postgres psql -U osprey_user -d osprey_labs

# Using psql client (if installed locally)
psql -h localhost -p 5432 -U osprey_user -d osprey_labs
```

### Viewing Logs

```bash
# View database logs
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f postgres
```

### Stopping the Database

```bash
# Stop the database container
docker-compose stop postgres

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (WARNING: This deletes all data)
docker-compose down -v
```

### Backing Up Data

```bash
# Create a backup
docker-compose exec postgres pg_dump -U osprey_user osprey_labs > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U osprey_user -d osprey_labs < backup.sql
```

## Database Schema

### Tables Overview

1. **admin_users** - Admin user accounts with authentication
2. **admin_sessions** - Session management for logged-in users
3. **articles** - Blog articles with full content management
4. **contact_submissions** - Contact form submissions
5. **job_applications** - Job application submissions
6. **chat_logs** - Chat conversation logs

### Key Features

- **UUID primary keys** for all tables
- **Automatic timestamps** with triggers
- **Proper indexing** for performance
- **Foreign key constraints** for data integrity
- **Check constraints** for data validation

## Authentication System

### Default Admin User

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@osprey-labs.com`
- **Role**: `super_admin`
- **API Key**: `osprey-admin-2024-secure-key`

### Login Methods

1. **Username/Password**: Creates session tokens for web interface
2. **API Key**: Direct API access for integrations

### Session Management

- Sessions expire after 7 days
- Automatic cleanup of expired sessions
- Multiple concurrent sessions supported
- Session invalidation on logout

## Troubleshooting

### Common Issues

1. **Port 5432 already in use**
   ```bash
   # Check what's using the port
   lsof -i :5432
   
   # Stop local PostgreSQL if running
   brew services stop postgresql  # macOS
   sudo systemctl stop postgresql # Linux
   ```

2. **Database connection refused**
   ```bash
   # Check if container is running
   docker-compose ps
   
   # Check container logs
   docker-compose logs postgres
   
   # Restart the container
   docker-compose restart postgres
   ```

3. **Permission denied errors**
   ```bash
   # Fix Docker permissions (Linux)
   sudo chown -R $USER:$USER .
   
   # Or run with sudo
   sudo docker-compose up postgres -d
   ```

4. **Database initialization failed**
   ```bash
   # Remove volumes and restart
   docker-compose down -v
   docker-compose up postgres -d
   ```

### Checking Database Health

```bash
# Test database connection
docker-compose exec postgres pg_isready -U osprey_user -d osprey_labs

# Check database size
docker-compose exec postgres psql -U osprey_user -d osprey_labs -c "SELECT pg_size_pretty(pg_database_size('osprey_labs'));"

# List all tables
docker-compose exec postgres psql -U osprey_user -d osprey_labs -c "\dt"
```

### Performance Monitoring

```bash
# Check active connections
docker-compose exec postgres psql -U osprey_user -d osprey_labs -c "SELECT count(*) FROM pg_stat_activity;"

# View slow queries (if enabled)
docker-compose exec postgres psql -U osprey_user -d osprey_labs -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## Development Workflow

### Making Schema Changes

1. **Create migration script** in `database/migrations/`
2. **Test locally** with development database
3. **Apply to production** during maintenance window

### Adding New Tables

1. **Update** `database/init/01-create-tables.sql`
2. **Add seed data** to `database/init/02-seed-data.sql`
3. **Create service class** in `src/lib/services/`
4. **Add API endpoints** in `src/app/api/`

### Testing Database Changes

```bash
# Reset database with new schema
docker-compose down -v
docker-compose up postgres -d

# Wait for initialization
sleep 10

# Test application
npm run dev
```

## Production Considerations

### Security

- Change default passwords
- Use environment variables for secrets
- Enable SSL connections
- Restrict network access
- Regular security updates

### Performance

- Configure connection pooling
- Monitor query performance
- Set up read replicas if needed
- Regular VACUUM and ANALYZE

### Backup Strategy

- Daily automated backups
- Point-in-time recovery setup
- Test restore procedures
- Off-site backup storage

### Monitoring

- Database metrics collection
- Alert on connection limits
- Monitor disk space usage
- Track slow queries

## Migration from File-Based Storage

If migrating from the previous file-based system:

1. **Export existing data** from JSON files
2. **Transform data format** to match database schema
3. **Import using SQL scripts** or API endpoints
4. **Verify data integrity** after migration
5. **Update application configuration**

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Docker and PostgreSQL logs
3. Verify environment configuration
4. Test database connectivity
5. Check application logs for errors

The database setup provides a robust foundation for the Osprey Labs application with proper authentication, data persistence, and scalability for future growth. 