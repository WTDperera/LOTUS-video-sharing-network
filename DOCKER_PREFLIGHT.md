# 🚀 Docker Pre-Flight Checklist

Run through this checklist before executing `docker-compose up --build`:

## ✅ Prerequisites

### Docker Installation
```bash
# Verify Docker is installed and running
docker --version
docker-compose --version

# Check Docker daemon is running
docker ps
```

### Port Availability
```bash
# Ensure ports are free
netstat -ano | findstr :5000   # Backend
netstat -ano | findstr :5173   # Frontend  
netstat -ano | findstr :27017  # MongoDB
```

### Disk Space
```bash
# Check available disk space (need ~2GB minimum)
Get-PSDrive C | Select-Object Used,Free
```

---

## 🎯 Execution Steps

### Step 1: Navigate to Project Root
```bash
cd C:\Users\Tharindu\Desktop\lotus-video-server
```

### Step 2: Start All Services
```bash
docker-compose up --build
```

### Step 3: Wait for Services (2-5 minutes)
Watch the logs for these success indicators:
- ✅ MongoDB: `Waiting for connections on port 27017`
- ✅ Backend: `Server running on http://localhost:5000`
- ✅ Frontend: `Built application successfully`

### Step 4: Verify Access
Open in browser:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/videos

---

## 🔍 What to Expect

### Build Phase (First Time: 3-5 minutes)
```
[+] Building...
=> [mongodb internal] load metadata
=> [server 1/6] FROM node:20-alpine
=> [client 1/8] FROM node:20-alpine
...
```

### Startup Phase (30-60 seconds)
```
mongodb    | [initandlisten] waiting for connections on port 27017
server     | Connected to MongoDB successfully
server     | Server running on http://localhost:5000
client     | Configuration complete. Starting nginx
```

### Ready State
```
✅ lotus-mongodb - healthy
✅ lotus-server - healthy  
✅ lotus-client - running
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Port Already in Use
**Symptom**: `Error starting userland proxy: listen tcp 0.0.0.0:5000: bind: address already in use`

**Solution**:
```bash
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Or change the port in docker-compose.yml
```

### Issue 2: Docker Daemon Not Running
**Symptom**: `Cannot connect to the Docker daemon`

**Solution**:
- Open Docker Desktop
- Wait for it to fully start (whale icon in system tray)
- Retry command

### Issue 3: Build Fails - Network Error
**Symptom**: `failed to fetch metadata` or `connection timeout`

**Solution**:
```bash
# Check internet connection
# Retry with cache cleanup
docker-compose build --no-cache
```

### Issue 4: MongoDB Won't Start
**Symptom**: `lotus-mongodb exited with code 1`

**Solution**:
```bash
# Remove old volumes
docker-compose down -v

# Start fresh
docker-compose up --build
```

### Issue 5: Frontend Shows Blank Page
**Symptom**: White screen or 502 Bad Gateway

**Solution**:
```bash
# Check backend is running
curl http://localhost:5000/api/videos

# Check client logs
docker-compose logs client

# Verify Nginx configuration
docker exec -it lotus-client nginx -t
```

---

## 📊 Success Indicators

### All Systems Go ✅
```bash
# Check container status
docker-compose ps

# Should show:
# NAME            STATUS                    PORTS
# lotus-mongodb   Up (healthy)              0.0.0.0:27017->27017/tcp
# lotus-server    Up (healthy)              0.0.0.0:5000->5000/tcp
# lotus-client    Up                        0.0.0.0:5173->80/tcp
```

### Test Endpoints
```bash
# Backend health (should return JSON with videos array)
curl http://localhost:5000/api/videos

# Frontend (should return HTML)
curl http://localhost:5173
```

### Browser Test
1. Open http://localhost:5173
2. Should see Lotus Video homepage
3. Console should be error-free
4. Network tab shows successful API calls to localhost:5000

---

## 🎉 Ready for Testing!

Once all checks pass:
1. ✅ Create a test user account
2. ✅ Upload a test video
3. ✅ Verify video playback
4. ✅ Test comments functionality
5. ✅ Check file persistence (stop/start containers)

---

## 🚨 Emergency Stop

If something goes wrong:

```bash
# Stop all containers immediately
docker-compose down

# Nuclear option - remove everything
docker-compose down -v
docker system prune -a --volumes
```

---

## 📝 Post-Verification

After successful testing:
```bash
# Commit the working configuration
git add docker-compose.yml DOCKER_*.md
git commit -m "feat: Docker local setup verified and working"
git push origin main
```

---

**You're ready to run: `docker-compose up --build`** 🚀
