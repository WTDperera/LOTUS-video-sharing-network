# Lotus Video Platform - Modular Architecture

## 🏗️ Project Structure

```
lotus-video-platform/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend (Node.js + Express)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── index.js
│   └── package.json
├── package.json           # Root orchestration
└── .git/                  # Version control
```

## 🚀 Quick Start

### Install All Dependencies
```bash
npm run install:all
```

### Development Mode
```bash
# Start both client and server concurrently
npm start

# Or individually:
npm run client   # Frontend on http://localhost:5173
npm run server   # Backend on http://localhost:5000
```

### Production Build
```bash
# Build client
npm run client:build

# Start server
npm run server:prod
```

## 📦 Package Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run both client & server concurrently |
| `npm run client` | Start Vite dev server (port 5173) |
| `npm run server` | Start Express server (port 5000) |
| `npm run install:all` | Install dependencies for root, client, and server |
| `npm run clean` | Remove all node_modules |

## 🔧 Configuration

### Client (.env in /client)
```env
VITE_API_URL=http://localhost:5000
```

### Server (.env in /server)
```env
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

## 🐳 Docker Ready

This modular structure is optimized for Docker deployment:
- Separate containers for client and server
- Independent scaling
- Clear service boundaries

## 📝 Notes

- Client runs on port 5173 (Vite default)
- Server runs on port 5000
- CORS configured for local development
- All uploads and static files handled by server
Testing Jenkins Auto Trigger 123