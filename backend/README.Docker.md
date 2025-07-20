# 🐳 Homeflix Docker Guide

Welcome to the Docker setup for **Homeflix**! This guide walks you through building, running, and deploying Homeflix
using Docker and Docker Compose, ensuring a smooth developer experience from local dev to cloud deployment.

---

## 🚀 Quick Start (Local Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/mariokreitz/Homeflix.git
   cd Homeflix/backend
   ```

2. **Start your application with Docker Compose**
   ```bash
   docker compose up --build
   ```
   Your API will be available at [http://localhost:5500](http://localhost:5500)

---

## 🌐 Cloud Deployment

1. **Build the Docker image for your target platform**  
   If your cloud uses a different CPU architecture (e.g., Mac M1 locally, AMD64 in cloud), specify the target:
   ```bash
   docker build --platform=linux/amd64 -t homeflix .
   ```

2. **Push the image to your registry**
   ```bash
   docker tag homeflix myregistry.com/homeflix
   docker push myregistry.com/homeflix
   ```

3. **Deploy using your preferred cloud provider**
    - Consult your provider's documentation for deploying Docker containers.

---

## 📝 References & Resources

- [Docker's Node.js Guide](https://docs.docker.com/language/nodejs/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker Getting Started](https://docs.docker.com/go/get-started-sharing/)

---

## 💡 Tips

- **Environment Variables**: Configure secrets & settings using `.env` files or Docker Compose environment sections.
- **Logs & Debugging**: Use `docker compose logs` to stream logs from your containers.
- **Scaling**: Add more services (database, cache, etc.) to your `docker-compose.yml` for a full stack experience.

---

## 📦 Example Docker Commands

```bash
# Stop containers
docker compose down

# View running containers
docker ps

# Attach to logs
docker compose logs -f

# Run migrations or scripts inside the container
docker compose exec backend npm run migrate
```

---

## 🏁 You're ready to deploy Homeflix anywhere Docker runs!