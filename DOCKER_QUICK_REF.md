# 🐳 Docker Quick Reference

## One-Command Start
```bash
docker-compose up --build
```

## Access URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## Useful Commands
```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Fresh start (deletes data)
docker-compose down -v && docker-compose up --build

# Restart a service
docker-compose restart server

# Rebuild specific service
docker-compose build server
```

## Default Credentials
- MongoDB User: `admin`
- MongoDB Password: `lotus_dev_password_2026`
- Database: `lotus_video`

## Troubleshooting
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs [mongodb|server|client]

# Access MongoDB shell
docker exec -it lotus-mongodb mongosh -u admin -p lotus_dev_password_2026
```
