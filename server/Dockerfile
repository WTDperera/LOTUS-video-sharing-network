# ==============================================
# SERVER DOCKERFILE
# Optimized for production deployment with DNS fix
# ==============================================

FROM node:20-alpine AS base

# FIX: Install ca-certificates and dnsmasq for proper DNS resolution in Alpine
# This fixes MongoDB Atlas DNS lookup errors (querySrv ENOTFOUND)
RUN apk add --no-cache \
    ffmpeg \
    ca-certificates \
    dnsmasq \
    bind-tools \
    && update-ca-certificates

# FIX: Configure DNS to use Google DNS (8.8.8.8) for reliable resolution
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/videos uploads/thumbnails uploads/avatars

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/videos', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "index.js"]
