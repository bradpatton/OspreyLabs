# Production Deployment Guide - PostgreSQL Integration

## 🚨 Current Issue: PostgreSQL Connection Errors

The error `getaddrinfo ENOTFOUND postgres` indicates that your production environment cannot find a PostgreSQL server at hostname `postgres`.

## 📋 Deployment Scenarios

### Scenario 1: Docker Compose Deployment (Recommended)

If you're deploying with Docker Compose, ensure both services are defined:

```yaml
# docker-compose.prod.yml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=osprey_labs
      - DB_USER=osprey_user
      - DB_PASSWORD=${DB_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - osprey_network

  postgres:
    image: postgres:15-alpine
    container_name: osprey_postgres_prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: osprey_labs
      POSTGRES_USER: osprey_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - osprey_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U osprey_user -d osprey_labs"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  osprey_network:
    driver: bridge
```

### Scenario 2: Platform Deployment (Dokploy, Railway, etc.)

If you're using a deployment platform like Dokploy, you need to:

#### Option A: Use Platform's PostgreSQL Service
```bash
# Set these environment variables in your platform:
DB_HOST=your-postgres-host.platform.com
DB_PORT=5432
DB_NAME=osprey_labs
DB_USER=osprey_user
DB_PASSWORD=your-secure-password
```

#### Option B: Deploy PostgreSQL Container Separately
1. Deploy PostgreSQL container first
2. Get the internal hostname/IP
3. Configure your app with the correct DB_HOST

### Scenario 3: External PostgreSQL Database

```bash
# Environment variables for external database:
DB_HOST=your-postgres-server.com
DB_PORT=5432
DB_NAME=osprey_labs
DB_USER=osprey_user
DB_PASSWORD=your-password
```

## 🔧 Troubleshooting Steps

### 1. Verify Environment Variables
```bash
# Check if environment variables are set correctly
echo $DB_HOST
echo $DB_PORT
echo $DB_NAME
echo $DB_USER
# Don't echo DB_PASSWORD for security
```

### 2. Test Network Connectivity
```bash
# From your app container, test if PostgreSQL is reachable:
ping postgres
nc -zv postgres 5432
```

### 3. Test Database Connection
```bash
# Test PostgreSQL connection with credentials:
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"
```

### 4. Check Container Logs
```bash
# Check app container logs
docker logs your-app-container

# Check PostgreSQL container logs
docker logs your-postgres-container
```

## 🚀 Quick Fix for Current Issue

### If PostgreSQL is Missing:
1. **Deploy PostgreSQL container** with the same network as your app
2. **Set correct environment variables**
3. **Ensure database initialization scripts run**

### If PostgreSQL Exists but Wrong Hostname:
Update your environment variables:
```bash
# Find your PostgreSQL container/service name
docker ps | grep postgres

# Update DB_HOST to match the actual hostname
DB_HOST=actual-postgres-hostname
```

## 📝 Environment Variables Checklist

### Required Variables:
- ✅ `DB_HOST` - PostgreSQL hostname (e.g., `postgres`, `localhost`, or external host)
- ✅ `DB_PORT` - PostgreSQL port (usually `5432`)
- ✅ `DB_NAME` - Database name (`osprey_labs`)
- ✅ `DB_USER` - Database user (`osprey_user`)
- ✅ `DB_PASSWORD` - Database password
- ✅ `OPENAI_API_KEY` - Your OpenAI API key
- ✅ `NEXTAUTH_SECRET` - NextAuth secret key
- ✅ `NEXTAUTH_URL` - Your app URL

### Development vs Production:
```bash
# Development (local Docker)
DB_HOST=localhost
DB_PORT=5434

# Production (Docker Compose)
DB_HOST=postgres
DB_PORT=5432

# Production (External DB)
DB_HOST=your-db-host.com
DB_PORT=5432
```

## 🔍 Debugging Commands

### Check App Health:
```bash
curl http://your-app-url/api/health
```

### Check Database from App Container:
```bash
# Enter app container
docker exec -it your-app-container sh

# Test database connection
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT NOW();"
```

### Check Network Configuration:
```bash
# List networks
docker network ls

# Inspect network
docker network inspect your-network-name

# Check container network settings
docker inspect your-container | jq '.[0].NetworkSettings'
```

## 📞 Support

If you're still experiencing issues:

1. **Check your deployment platform documentation** for PostgreSQL setup
2. **Verify network configuration** between containers
3. **Ensure environment variables are correctly set**
4. **Check firewall/security group settings** for database access

## 🎯 Next Steps

1. Identify your deployment scenario (Docker Compose, Platform, External DB)
2. Follow the appropriate configuration steps above
3. Test the database connection
4. Deploy and verify the health endpoint

---

**Need help?** Contact: brad@ospreylaboratories.com 