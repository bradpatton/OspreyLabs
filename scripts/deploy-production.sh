#!/bin/bash

set -e

echo "🚀 Starting Osprey Labs Production Deployment"
echo "=============================================="

# Check if required files exist
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production not found"
    echo "Please create .env.production with your production environment variables"
    exit 1
fi

# Load production environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Validate required environment variables
required_vars=("DB_PASSWORD" "OPENAI_API_KEY" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional - uncomment if you want to force rebuild)
# echo "🗑️  Removing old images..."
# docker-compose -f docker-compose.prod.yml down --rmi all

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
timeout=300  # 5 minutes
elapsed=0
interval=10

while [ $elapsed -lt $timeout ]; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
        echo "✅ Services are healthy!"
        break
    fi
    
    echo "⏳ Waiting for services... ($elapsed/$timeout seconds)"
    sleep $interval
    elapsed=$((elapsed + interval))
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Timeout waiting for services to be healthy"
    echo "📋 Container status:"
    docker-compose -f docker-compose.prod.yml ps
    echo "📋 Container logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Test the health endpoint
echo "🔍 Testing application health..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Application is responding to health checks"
else
    echo "❌ Application health check failed"
    echo "📋 Application logs:"
    docker-compose -f docker-compose.prod.yml logs web
    exit 1
fi

# Test database connectivity
echo "🔍 Testing database connectivity..."
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U osprey_user -d osprey_labs > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database connectivity test failed"
    echo "📋 Database logs:"
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "=============================================="
echo "📊 Application Status:"
echo "   • Web Application: http://localhost"
echo "   • Health Check: http://localhost/api/health"
echo "   • Database: PostgreSQL on port 5432"
echo ""
echo "📋 Useful Commands:"
echo "   • View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   • Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   • Database backup: docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U osprey_user osprey_labs > backup.sql"
echo ""
echo "🔧 Admin Access:"
echo "   • Admin Panel: http://localhost/admin"
echo "   • Default credentials: admin / admin123"
echo "   • Change default password immediately!"
echo "" 