# Docker Setup for CoParent

This directory contains Docker configuration for running the entire CoParent stack (MongoDB, API, and UI) in containers.

## Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose v2.0+

## Quick Start

1. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Auth0 credentials (and optional UI idle timeout settings).

2. **Start all services:**
   ```bash
   docker-compose up
   ```

3. **Access the application:**
   - UI: http://localhost:5173
   - API: http://localhost:3000
   - MongoDB: localhost:27017

## Services

### MongoDB
- **Image:** mongo:7
- **Port:** 27017
- **Data:** Persisted in `mongo_data` volume
- **Healthcheck:** Ensures database is ready before API starts

### API (NestJS)
- **Port:** 3000
- **Database:** Connects to MongoDB container
- **Hot Reload:** Source files mounted for development
- **Command:** Runs `pnpm dev` for development mode

### UI (React + Vite)
- **Port:** 5173 (mapped to container port 80)
- **Server:** Nginx in production mode
- **API Connection:** http://localhost:3000

## Common Commands

### Start services in background
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop services and remove volumes (deletes database data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f ui
docker-compose logs -f mongodb
```

### Rebuild containers
```bash
docker-compose up --build
```

### Restart a specific service
```bash
docker-compose restart api
```

## Development Mode

The API service mounts source directories for hot reload:
- `/app/apps/api/src` - API source code
- `/app/packages/shared-types/src` - Shared types

Changes to these files will trigger automatic reload.

## Production Mode

For production deployment, remove the volume mounts and command override from the API service in `docker-compose.yml`:

```yaml
api:
  # Remove these for production:
  # volumes:
  #   - ../apps/api/src:/app/apps/api/src
  # command: pnpm dev
```

## Network

All services run on a shared bridge network (`coparent-network`), allowing them to communicate using service names:
- API connects to MongoDB using `mongodb://mongodb:27017/coparent`
- Services can reference each other by container name

## Troubleshooting

### MongoDB healthcheck fails
If MongoDB healthcheck keeps failing, try increasing timeout/interval in docker-compose.yml.

### Port already in use
If ports 3000, 5173, or 27017 are already in use, modify the port mappings in docker-compose.yml:
```yaml
ports:
  - "8080:3000"  # Map to different host port
```

### Build fails
Clear Docker cache and rebuild:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```
