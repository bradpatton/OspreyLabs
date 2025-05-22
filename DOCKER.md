# Docker Deployment Guide

This guide provides instructions for deploying the Osprey Labs website using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system
- Git (for cloning the repository)

## Environment Setup

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Configure the following environment variables in `.env`:
```
ADMIN_API_KEY=your_secure_admin_key_here
NODE_ENV=production
PORT=3000
```

## Building and Running

### Development Mode

To run the application in development mode:

```bash
# Build and start the containers
docker-compose up --build

# To run in detached mode
docker-compose up -d --build
```

### Production Mode

For production deployment:

```bash
# Build the production image
docker build -t osprey-labs:prod .

# Run the container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/logs:/app/logs \
  -e ADMIN_API_KEY=your_secure_admin_key_here \
  -e NODE_ENV=production \
  --name osprey-labs \
  osprey-labs:prod
```

## Container Management

### Viewing Logs

```bash
# View all container logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f web
```

### Stopping the Application

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Restarting the Application

```bash
# Restart all services
docker-compose restart

# Restart a specific service
docker-compose restart web
```

## Health Checks

The application includes health checks that run every 30 seconds. You can monitor the health status using:

```bash
docker inspect --format='{{.State.Health.Status}}' osprey-labs
```

## Persistent Storage

The application uses Docker volumes to persist:
- Resume files in the `logs/resumes` directory
- Application logs in the `logs` directory

These directories are mounted from your host system to ensure data persistence across container restarts.

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - If port 3000 is already in use, modify the port mapping in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Change 3001 to your preferred port
   ```

2. **Permission Issues**
   - If you encounter permission issues with the logs directory:
   ```bash
   sudo chown -R 1000:1000 logs/
   ```

3. **Container Won't Start**
   - Check the logs:
   ```bash
   docker-compose logs web
   ```
   - Verify environment variables are set correctly
   - Ensure the ports are not in use

### Debugging

1. **Access Container Shell**
   ```bash
   docker-compose exec web sh
   ```

2. **View Container Details**
   ```bash
   docker inspect osprey-labs
   ```

3. **Check Container Resources**
   ```bash
   docker stats osprey-labs
   ```

## Security Considerations

1. **API Keys**
   - Never commit `.env` files to version control
   - Use strong, unique API keys
   - Rotate keys periodically

2. **File Permissions**
   - The application runs as a non-root user
   - Ensure proper permissions on mounted volumes

3. **Network Security**
   - Only expose necessary ports
   - Use internal Docker networks for service communication

## Updating the Application

To update the application:

1. Pull the latest changes:
```bash
git pull origin main
```

2. Rebuild and restart:
```bash
docker-compose up -d --build
```

## Monitoring

The application includes basic health checks. For production deployments, consider:

1. Setting up container monitoring (e.g., Prometheus, Grafana)
2. Implementing log aggregation
3. Setting up alerts for container health status

## Backup and Recovery

### Backup

1. **Application Data**
   ```bash
   # Backup logs directory
   tar -czf logs_backup.tar.gz logs/
   ```

2. **Docker Volumes**
   ```bash
   # Backup Docker volumes
   docker run --rm -v osprey-labs_logs:/source -v $(pwd):/backup alpine tar -czf /backup/volume_backup.tar.gz -C /source .
   ```

### Recovery

1. **Restore Application Data**
   ```bash
   # Restore logs directory
   tar -xzf logs_backup.tar.gz
   ```

2. **Restore Docker Volumes**
   ```bash
   # Restore Docker volumes
   docker run --rm -v osprey-labs_logs:/target -v $(pwd):/backup alpine sh -c "cd /target && tar -xzf /backup/volume_backup.tar.gz"
   ```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Documentation](https://nextjs.org/docs) 