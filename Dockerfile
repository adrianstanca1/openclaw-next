# OpenClaw Next - Production Dockerfile
# React Vite Control Panel for Agentic Gateway

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_GATEWAY_URL=http://localhost:18789
ARG VITE_GATEWAY_TOKEN=""
ARG VITE_OLLAMA_HOST=http://localhost:11434
ARG VITE_OLLAMA_MODEL=llama3.2

# Set environment variables for build
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL
ENV VITE_GATEWAY_TOKEN=$VITE_GATEWAY_TOKEN
ENV VITE_OLLAMA_HOST=$VITE_OLLAMA_HOST
ENV VITE_OLLAMA_MODEL=$VITE_OLLAMA_MODEL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 3000;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # Handle SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]