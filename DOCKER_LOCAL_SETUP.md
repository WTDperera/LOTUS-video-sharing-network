# 🐳 Docker Local Setup Guide

## Quick Start - One Command Deployment

Run the entire application stack (Frontend + Backend + Database) with a single command:

```bash
docker-compose up --build
```

That's it! The entire application will be built and running in containers.

---

## 📋 What Gets Started

When you run `docker-compose up --build`, three services start automatically:

### 1. **MongoDB Database** (`lotus-mongodb`)
- **Image**: MongoDB 7.0
- **Port**: 27017 (exposed to host)
- **Credentials**: 
  - Username: `admin`
  - Password: `lotus_dev_password_2026`
  - Database: `lotus_video`
- **Volume**: `mongodb_data` (persists data between restarts)

### 2. **Backend Server** (`lotus-server`)
- **Port**: 5000 (exposed to host)
- **Environment**: Production mode with pre-configured settings
- **Features**:
  - JWT authentication ready
  - Security middleware active
  - Rate limiting enabled
  - File upload support (50MB limit)
- **Volume**: `./server/uploads` mounted for persistent video storage

### 3. **Frontend Client** (`lotus-client`)
- **Port**: 5173 (exposed to host, served by Nginx on port 80 inside container)
- **Technology**: React + Vite (production build served by Nginx)
- **API Proxy**: Automatically configured to connect to backend

---

## 🚀 Accessing the Application

Once all containers are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React application (Nginx) |
| **Backend API** | http://localhost:5000 | Express REST API |
| **MongoDB** | mongodb://localhost:27017 | Database (use MongoDB Compass) |

---

## 📝 Detailed Commands

### Start Everything (Build + Run)
```bash
docker-compose up --build
```
- Builds Docker images from Dockerfiles
- Starts all containers
- Shows logs from all services in terminal

### Start in Detached Mode (Background)
```bash
docker-compose up --build -d
```
- Runs containers in background
- Returns control to terminal

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongodb
```

### Stop All Containers
```bash
docker-compose down
```

### Stop and Remove Volumes (Fresh Start)
```bash
docker-compose down -v
```
⚠️ This deletes the MongoDB data volume!

### Rebuild a Specific Service
```bash
# Rebuild only backend
docker-compose build server

# Rebuild only frontend
docker-compose build client
```

### Restart a Service
```bash
docker-compose restart server
docker-compose restart client
```

---

## 🔍 Health Checks

The docker-compose.yml includes health checks for reliable startup:

1. **MongoDB Health Check**
   - Pings database every 10 seconds
   - Backend waits for healthy MongoDB before starting

2. **Backend Health Check**
   - Checks `/api/videos` endpoint every 10 seconds
   - Frontend waits for healthy backend before starting

This ensures services start in the correct order and are fully operational before dependent services connect.

---

## 🗂️ Environment Variables (Pre-Configured)

All environment variables are hardcoded in `docker-compose.yml` for local development:

### MongoDB
```yaml
MONGO_INITDB_ROOT_USERNAME: admin
MONGO_INITDB_ROOT_PASSWORD: lotus_dev_password_2026
MONGO_INITDB_DATABASE: lotus_video
```

### Backend Server
```yaml
NODE_ENV: production
PORT: 5000
MONGODB_URI: mongodb://admin:lotus_dev_password_2026@mongodb:27017/lotus_video?authSource=admin
JWT_SECRET: dev_jwt_secret_key_for_local_testing_32chars_minimum_required
JWT_EXPIRE: 7d
ALLOWED_ORIGINS: http://localhost:5173,http://localhost:80,http://client:80
MAX_FILE_SIZE: 52428800  # 50MB
RATE_LIMIT_MAX: 100
```

### Frontend Client
```yaml
VITE_API_URL: http://localhost:5000
```

---

## 🐛 Troubleshooting

### Port Already in Use
If you see "port already allocated" errors:

```bash
# Check what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :5173
netstat -ano | findstr :27017

# Stop the process or change ports in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker-compose logs [service-name]

# Remove everything and start fresh
docker-compose down -v
docker-compose up --build
```

### MongoDB Connection Issues
```bash
# Verify MongoDB is healthy
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker exec -it lotus-mongodb mongosh -u admin -p lotus_dev_password_2026 --authenticationDatabase admin
```

### Build Cache Issues
```bash
# Rebuild without cache
docker-compose build --no-cache

# Start fresh
docker-compose up --build --force-recreate
```

### Volume Permissions (Linux/Mac)
```bash
# Ensure uploads directory has correct permissions
sudo chown -R 1000:1000 ./server/uploads
```

---

## 📦 Docker Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Host                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           lotus-network (Bridge)                 │  │
│  │                                                  │  │
│  │  ┌────────────────┐  ┌─────────────────────┐   │  │
│  │  │   MongoDB      │  │   Backend Server    │   │  │
│  │  │   (mongo:7.0)  │←─│   (Node + Express)  │   │  │
│  │  │   Port: 27017  │  │   Port: 5000        │   │  │
│  │  │   Volume: DB   │  │   Volume: Uploads   │   │  │
│  │  └────────────────┘  └─────────────────────┘   │  │
│  │          ↑                      ↑               │  │
│  │          │                      │               │  │
│  │          │         ┌────────────────────┐      │  │
│  │          │         │  Frontend Client   │      │  │
│  │          └─────────│  (React + Nginx)   │      │  │
│  │                    │  Port: 80→5173     │      │  │
│  │                    └────────────────────┘      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Access Points:                                         │
│  - http://localhost:5173 → Frontend                     │
│  - http://localhost:5000 → Backend API                  │
│  - mongodb://localhost:27017 → MongoDB                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Notes

**⚠️ IMPORTANT**: The credentials in `docker-compose.yml` are for **LOCAL DEVELOPMENT ONLY**.

For production deployment:
1. Move all secrets to environment variables or secret managers
2. Use strong, randomly generated passwords
3. Never commit production credentials to Git
4. Consider using Docker secrets or Kubernetes secrets

---

## 🚢 Next Steps - Jenkins CI/CD

Once local Docker testing is complete:

1. **Verify Everything Works**
   ```bash
   docker-compose up --build
   # Test frontend at http://localhost:5173
   # Test API at http://localhost:5000/api/videos
   ```

2. **Commit Docker Configuration**
   ```bash
   git add docker-compose.yml DOCKER_LOCAL_SETUP.md
   git commit -m "feat: Docker local setup ready for Jenkins"
   git push origin main
   ```

3. **Jenkins Pipeline Setup**
   - Jenkins will use the same Dockerfiles
   - Production environment variables will be injected
   - Multi-stage builds ensure optimized images

---

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## ✅ Verification Checklist

Before proceeding to Jenkins, verify:

- [ ] `docker-compose up --build` starts all three containers
- [ ] MongoDB is accessible and healthy
- [ ] Backend API responds at http://localhost:5000
- [ ] Frontend loads at http://localhost:5173
- [ ] Frontend can communicate with backend API
- [ ] File uploads work (video uploads persist in `./server/uploads`)
- [ ] `docker-compose down` stops all containers cleanly
- [ ] `docker-compose up` (without --build) starts from existing images

---

**Ready to containerize! 🎉**
