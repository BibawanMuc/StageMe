# StageMe - Docker Deployment Guide

This guide explains how to deploy StageMe on a Hostinger VPS using Docker and Nginx Proxy Manager.

## Prerequisites

- Hostinger VPS with Docker and Docker Compose installed
- Nginx Proxy Manager (NPM) running on `proxy-netz` network
- Domain name pointed to your VPS
- Supabase project set up
- Google Gemini API key

## Deployment Steps

### 1. Prepare Your VPS

SSH into your Hostinger VPS:

```bash
ssh root@your-vps-ip
```

### 2. Clone the Repository

```bash
cd /opt
git clone <your-repo-url> stageme
cd stageme
```

### 3. Configure Environment Variables

Create `.env.local` file with your production credentials:

```bash
nano .env.local
```

Add your credentials:

```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

**IMPORTANT:** The `.env.local` file must be created BEFORE building the Docker image, as Vite bakes environment variables into the build at compile time.

### 4. Build Environment Variables into Image

Since Vite requires environment variables at build time, we need to modify the Dockerfile to include them:

```bash
# Option A: Build with build args (recommended)
docker build \
  --build-arg VITE_GEMINI_API_KEY="your_key" \
  --build-arg VITE_SUPABASE_URL="your_url" \
  --build-arg VITE_SUPABASE_ANON_KEY="your_key" \
  -t stageme:latest .

# Option B: Use .env.local during build
# Make sure .env.local exists, then:
docker-compose build
```

### 5. Start the Container

```bash
docker-compose up -d
```

Check if it's running:

```bash
docker-compose ps
docker-compose logs -f
```

### 6. Configure Nginx Proxy Manager

1. Open your Nginx Proxy Manager dashboard
2. Go to **Proxy Hosts** → **Add Proxy Host**
3. Configure:
   - **Domain Names:** `stageme.yourdomain.com`
   - **Scheme:** `http`
   - **Forward Hostname/IP:** `stageme-app` (container name)
   - **Forward Port:** `80`
   - **Block Common Exploits:** ✓
   - **Websockets Support:** ✓

4. Go to **SSL** tab:
   - **SSL Certificate:** Request a new Let's Encrypt certificate
   - **Force SSL:** ✓
   - **HTTP/2 Support:** ✓

5. Save

### 7. Verify Deployment

Visit `https://stageme.yourdomain.com` and test:

- Photo capture/upload
- Drawing canvas
- Stage selection
- Image generation
- QR code download

## Updating the Application

When you need to update:

```bash
cd /opt/stageme
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Environment Variables Not Working

**Problem:** API calls fail with "API Key not found"

**Solution:** Vite requires env vars at BUILD time, not runtime:

```bash
# Rebuild with env vars
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Container Won't Start

Check logs:

```bash
docker-compose logs stageme
```

### Nginx 502 Bad Gateway

1. Verify container is running: `docker ps`
2. Check container logs: `docker-compose logs`
3. Verify NPM can reach container: `docker network inspect proxy-netz`

### CORS Issues

If you get CORS errors, ensure your Supabase project allows your domain in the allowed origins.

## Alternative: Build Args Method

For better security, use build arguments instead of .env.local:

**Modified Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

ARG VITE_GEMINI_API_KEY
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Modified docker-compose.yml:**

```yaml
version: "3.8"

services:
  stageme:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_GEMINI_API_KEY: ${VITE_GEMINI_API_KEY}
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
        VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
    container_name: stageme-app
    restart: unless-stopped
    ports:
      - "3000:80"
    networks:
      - proxy-netz

networks:
  proxy-netz:
    external: true
```

Then use `.env` file (not `.env.local`) for docker-compose:

```bash
# Create .env file
cat > .env << EOF
VITE_GEMINI_API_KEY=your_key
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
EOF

# Build and run
docker-compose up -d --build
```

## Security Notes

- Never commit `.env.local` or `.env` to git
- Keep your Gemini API key secure
- Use Supabase RLS policies to protect data
- Enable HTTPS via Nginx Proxy Manager
- Regularly update Docker images

## Performance Optimization

For production, consider:

- Enabling Nginx gzip compression (already configured)
- Using CDN for static assets
- Implementing rate limiting in NPM
- Monitoring with Docker stats: `docker stats stageme-app`

## Backup

Important files to backup:

- `.env.local` or `.env` (environment variables)
- `docker-compose.yml` (if customized)
- Supabase database (via Supabase dashboard)
