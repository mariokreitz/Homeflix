# 🎬 Homeflix

> **A Next-Gen, Scalable Backend for Streaming & Media Platforms**

Homeflix is a cutting-edge Node.js backend built for modern streaming and media management applications. With advanced
security, scalable session management, OpenAPI docs, and seamless Docker deployment, it's designed for developers who
want robust, production-ready foundations with zero fuss.

---

## 🚀 Features at a Glance

- **Express.js REST API** — Fast, modular endpoints ready for any media workflow
- **Modern Auth** — JWT & refresh tokens, CSRF protection, secure cookies
- **Redis Sessions** — Scalable, persistent session storage with Redis
- **Rate Limiting** — Prevent API abuse out-of-the-box
- **Swagger/OpenAPI** — Interactive API docs and schema validation
- **Centralized Error Handling** — Consistent, developer-friendly error responses
- **Health Checks** — Built-in uptime and status endpoint
- **Detailed Logging** — Request, server, and DB activity logs
- **Graceful Shutdown** — Ensures clean disconnect and resource management
- **Docker-First** — Effortless local dev, CI/CD, and cloud deployment

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── app.js                # Express app & middleware setup
│   ├── controllers/          # API controllers (authentication, etc.)
│   ├── middlewares/          # Session, auth, error handler, rate limiters
│   ├── routes/               # Route definitions
│   ├── services/             # Redis, Prisma, token, logging
│   ├── config/               # Environment setup, Swagger config
│   └── ...
├── server.js                 # Entrypoint & graceful shutdown logic
├── README.Docker.md          # Docker deployment instructions
└── ...
```

---

## 🛠️ Quickstart

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access API at:
http://localhost:5500
```

### Docker Deployment

See [`backend/README.Docker.md`](backend/README.Docker.md) for complete Docker instructions.

```bash
# Build and run with Docker Compose
docker compose up --build

# Build for target architecture (cloud, CI/CD)
docker build --platform=linux/amd64 -t homeflix .
docker push yourregistry.com/homeflix
```

---

## 📡 API Overview

- **Auth endpoints:** `/api/v1/auth`
- **Health check:** `/` (returns uptime, status)
- **Future:** Extend with `/api/v1/media` and more

Docs auto-generated via Swagger/OpenAPI.

---

## 🛡️ Security & Best Practices

- **Helmet**: Secure HTTP headers
- **CORS**: Configurable trusted origins
- **Secure Cookies**: HttpOnly, SameSite strict, secure flag
- **Rate Limiting**: Configurable to fit your needs

---

## ⚙️ Tech Stack

- Node.js (Express)
- Redis (Session store)
- Prisma (ORM/database)
- JWT (auth)
- Docker (containerization)
- Swagger (API docs)

---

## 📚 References & Resources

- [Docker’s Node.js guide](https://docs.docker.com/language/nodejs/)
- [Docker Getting Started](https://docs.docker.com/go/get-started-sharing/)

---

## 📝 License

> _No license specified yet._

---

## 👤 Author

**Mario Kreitz**  
GitHub: [@mariokreitz](https://github.com/mariokreitz)

---

## 💡 Inspiration

Homeflix is built for developers who want a modern, secure, and extensible backend with all the essentials for building
the next streaming hit or media management platform.

---

**Ready to binge-code?**  
Clone, run, and start building your own Homeflix experience!