# 🐳 Homeflix Docker Guide

This guide explains how to set up, develop, and deploy the **Homeflix** application using Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Development Environment](#development-environment)
- [Database Management](#database-management)
- [Production Environment](#production-environment)
- [Frontend Management](#frontend-management)
- [Useful Docker Commands](#useful-docker-commands)
- [Troubleshooting](#troubleshooting)
- [References](#references)

## 🛠️ Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
- Git installed (for cloning the repository)
- An `.env` file in the `backend/` directory (copy `.example.env` as a template)

## 🗂️ Project Structure

The Docker configuration includes the following services:

| Service  | Description                     | Port | Access Credentials (Development)           | Profile        |
|----------|---------------------------------|------|--------------------------------------------|----------------|
| backend  | Node.js Express API             | 5500 | -                                          | default        |
| db       | PostgreSQL 16 Database          | 5432 | User: postgres, Password: postgres         | default        |
| redis    | Redis 7 Cache Server            | 6379 | -                                          | default        |
| frontend | Angular Frontend                | 4200 | -                                          | frontend, full |
| pgadmin  | PostgreSQL Admin Interface      | 5050 | Email: test@gmail.com, PW: password123test | dev, tools     |
| db-init  | Database Initialization Service | -    | -                                          | init           |

## 🚀 Development Environment

### Quick Start

1. **Clone repository**
   ```bash
   git clone https://github.com/mariokreitz/Homeflix.git
   cd Homeflix/backend
   ```

2. **Set up environment variables**
   ```bash
   cp .example.env .env
   # Edit .env as needed
   ```

3. **Start only database and Redis (for local Node development)**
   ```bash
   npm run db:start
   # Or: docker compose up -d db redis pgadmin
   ```

4. **Local development with Docker DB**
   ```bash
   npm run dev:docker
   # Starts DB services and runs "npm run dev"
   ```

5. **Start the entire application with Docker**
   ```bash
   docker compose up --build
   # Or: docker compose up -d for background mode
   ```

6. **Start full development stack (backend + frontend + tools)**
   ```bash
   npm run dev:full
   # Or: docker compose --profile full up --build
   ```

After startup, the following services are available:

- API: [http://localhost:5500](http://localhost:5500)
- API Documentation: [http://localhost:5500/api-docs](http://localhost:5500/api-docs)
- Frontend (when enabled): [http://localhost:4200](http://localhost:4200)
- PGAdmin: [http://localhost:5050](http://localhost:5050)

## 💾 Database Management

### Initialize Database

```bash
npm run db:init
# Or: docker compose --profile init up db-init
```

### Start Prisma Studio (DB GUI)

```bash
npm run db:studio
# Starts Prisma Studio at http://localhost:5555
```

### Reset Database

```bash
npm run db:reset
# Or for complete reinitialization: npm run db:init
```

### Insert Seed Data

```bash
npm run seed
# Inserts demo data based on prisma/seed.js
```

### Stop Database Services

```bash
npm run db:stop
# Stops db, redis and pgadmin containers
```

## 🌐 Production Environment

### Create Production Build

```bash
npm run prod:build
# Or: docker compose --profile prod build
```

### Start Production Environment

```bash
npm run prod:up
# Or: docker compose --profile prod up -d
```

### Shut Down Production Environment

```bash
npm run prod:down
# Or: docker compose --profile prod down
```

### View Production Logs

```bash
npm run prod:logs
# Or: docker compose --profile prod logs -f backend
```

## 🖥️ Frontend Management

### Start Only Frontend

```bash
npm run frontend:up
# Or: docker compose --profile frontend up -d
```

### Start Full Stack (Frontend + Backend + DB)

```bash
npm run full:up
# Or: docker compose --profile full up -d
```

## 🔧 Development Tools

### Start Development Tools

```bash
npm run tools:up
# Or: docker compose --profile tools up -d
# Starts services like pgadmin
```

## 🛠️ Useful Docker Commands

```bash
# Build all containers
npm run docker:build
# Or: docker compose build

# Start all containers (foreground)
npm run docker:up
# Or: docker compose up

# Start all containers (background)
npm run docker:up:detach
# Or: docker compose up -d

# Stop all containers
npm run docker:down
# Or: docker compose down

# View container logs
npm run docker:logs
# Or: docker compose logs -f

# Show container status
npm run docker:ps
# Or: docker compose ps

# Delete volume data (Caution: Deletes all data!)
npm run docker:clean
# Or: docker compose down -v

# Access a running container
docker compose exec backend sh
docker compose exec db psql -U postgres -d homeflix
docker compose exec redis redis-cli
```

## ⚠️ Troubleshooting

### Container fails to start

Check the logs:

```bash
docker compose logs backend
```

### Database connection errors

1. Ensure the database is running:
   ```bash
   docker compose ps
   ```

2. Check the `DATABASE_URL` in your `.env` file:
    - For local development: `postgresql://postgres:postgres@localhost:5432/homeflix`
    - Within Docker: `postgresql://postgres:postgres@db:5432/homeflix`

### Redis connection errors

1. Ensure Redis is running:
   ```bash
   docker compose ps
   ```

2. Check the `REDIS_URL` in your `.env` file:
    - For local development: `redis://localhost:6379`
    - Within Docker: `redis://redis:6379`

### Frontend not accessible

Check if the frontend container is running:

```bash
docker compose ps frontend
```

## 📚 References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md)
