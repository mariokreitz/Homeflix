# 🚧 Frontend Coming Soon! 🚧

> **Homeflix will be a fullstack project. The official frontend is coming soon and will be built with Angular v20+! Stay
tuned for the complete streaming platform experience.**

![screenshot](https://raw.githubusercontent.com/mariokreitz/Homeflix/refs/heads/main/homeflix_cover.png)
---

# 🎬 Homeflix

> **A Full-Stack Media Streaming Platform with Angular Frontend and Express Backend**

Homeflix is a cutting-edge media streaming platform built with modern web technologies. Featuring a robust Node.js
backend and Angular frontend, it offers advanced security, scalable session management, interactive API documentation,
and seamless Docker deployment for developers who want a production-ready foundation with zero fuss.

---

## 🚀 Features at a Glance

### Backend

- **Express.js REST API** — Fast, modular endpoints for media workflows
- **Modern Auth** — JWT & refresh tokens, CSRF protection, secure cookies
- **Redis Sessions** — Scalable, persistent session storage with Redis
- **Rate Limiting** — Prevent API abuse out-of-the-box
- **Swagger/OpenAPI** — Interactive API docs and schema validation
- **Prisma ORM** — Type-safe database access with PostgreSQL
- **Docker Integration** — Multiple profiles for different deployment scenarios

### Frontend

- **Angular v20+** — Modern, component-based UI architecture
- **TailwindCSS** — Sleek, responsive user interface
- **Docker Integration** — Containerized deployment with Nginx
- **API Integration** — Seamless connection to backend services

### DevOps

- **Docker Compose** — Multi-container orchestration for local and production
- **Service Profiles** — Customizable deployment configurations
- **Health Checks** — Automated service monitoring
- **Centralized Logging** — Comprehensive activity tracking

---

## 🏗️ Architecture

Homeflix follows a modern microservices architecture:

- **Frontend**: Angular application served via Nginx
- **Backend**: Express.js API with modular controllers and services
- **Database**: PostgreSQL with Prisma ORM
- **Cache & Sessions**: Redis for performance and scalability
- **Development Tools**: PGAdmin for database management

---

## 🗂️ Project Structure

```
homeflix/
├── backend/
│   ├── src/
│   │   ├── app.js            # Express app & middleware setup
│   │   ├── controllers/      # API controllers (authentication, etc.)
│   │   ├── middlewares/      # Session, auth, error handler, rate limiters
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Redis, Prisma, token, logging
│   │   └── config/           # Environment setup, Swagger config
│   ├── prisma/               # Database schema and migrations
│   ├── server.js             # Entrypoint & graceful shutdown logic
│   └── README.Docker.md      # Backend Docker instructions
│
├── frontend/
│   ├── src/                  # Angular application source
│   ├── Dockerfile            # Frontend container configuration
│   └── nginx.conf            # Nginx web server configuration
│
└── compose.yaml              # Docker Compose configuration
```

---

## 🛠️ Quickstart

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for local development)
- [Git](https://git-scm.com/)

### Full-Stack Docker Deployment

```bash
# Clone the repository
git clone https://github.com/mariokreitz/Homeflix.git
cd Homeflix/backend

# Start the full stack (backend, frontend, database, redis)
npm run full:up

# Access the application at:
# Frontend: http://localhost:4200
# API: http://localhost:5500
# API Docs: http://localhost:5500/api-docs
```

### Local Backend Development

```bash
# Start database and Redis services
npm run db:start

# Install backend dependencies
cd backend
npm install

# Run backend in development mode
npm run dev

# Access API at http://localhost:5500
```

### Development Tools

```bash
# Start PGAdmin for database management
npm run tools:up

# Access PGAdmin at http://localhost:5050
# (Email: test@gmail.com, Password: password123test)

# Start Prisma Studio (alternative DB interface)
npm run db:studio

# Access Prisma Studio at http://localhost:5555
```

---

## 🐳 Docker Profiles

Homeflix uses Docker Compose profiles for flexible deployment options:

| Profile    | Description                                         |
|------------|-----------------------------------------------------|
| `default`  | Backend API, PostgreSQL, and Redis                  |
| `frontend` | Angular frontend application                        |
| `full`     | Complete stack (backend, frontend, database, redis) |
| `dev`      | Development tools (PGAdmin)                         |
| `tools`    | Database management tools                           |
| `init`     | Database initialization service                     |
| `prod`     | Production-optimized services                       |

For detailed Docker instructions, see [`backend/README.Docker.md`](backend/README.Docker.md).

---

## 📡 API Overview

- **Auth endpoints:** `/api/v1/auth`
- **Health check:** `/api/v1/health`
- **API Documentation:** `/api-docs`

---

## 🛡️ Security & Best Practices

- **Helmet**: Secure HTTP headers
- **CORS**: Configurable trusted origins
- **Secure Cookies**: HttpOnly, SameSite strict, secure flag
- **Rate Limiting**: Redis-backed request throttling
- **Input Validation**: Request schema validation with Joi
- **Token Management**: Secure refresh/access token rotation

---

## ⚙️ Tech Stack

### Backend

- **Node.js & Express**: API framework
- **PostgreSQL & Prisma**: Database and ORM
- **Redis**: Session store and caching
- **JWT**: Authentication tokens
- **Swagger**: API documentation

### Frontend

- **Angular**: UI framework
- **TailwindCSS**: Responsive styling, utility-first CSS framework
- **Nginx**: Web server

### Infrastructure

- **Docker & Docker Compose**: Containerization
- **Health Checks**: Service monitoring
- **Winston & Morgan**: Logging

---

## 📝 License

> _No license specified yet._

---

## 👤 Author

**Mario Kreitz**  
GitHub: [@mariokreitz](https://github.com/mariokreitz)

---

**Ready to stream your code?**  
Clone, deploy, and start building your own Homeflix experience!
