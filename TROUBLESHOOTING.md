# Troubleshooting 502 Bad Gateway Error

## Quick Diagnostics

Run these commands on your VPS to diagnose the issue:

### 1. Check if container is running

```bash
docker ps | grep stageme
```

**Expected output:** You should see `stageme-app` container running on port 3000:80

### 2. Check container logs

```bash
docker logs stageme-app
```

**Look for:** Any error messages or startup issues

### 3. Test container directly

```bash
curl http://localhost:3000
```

**Expected:** HTML content from the app

### 4. Check if container is on proxy-netz network

```bash
docker network inspect proxy-netz | grep stageme
```

**Expected:** `stageme-app` should be listed

### 5. Check Nginx inside container

```bash
docker exec stageme-app nginx -t
```

**Expected:** "syntax is ok" and "test is successful"

## Common Issues & Fixes

### Issue 1: Container not on proxy-netz network

**Symptom:** Container running but NPM can't reach it

**Fix:**

```bash
cd /opt/docker/stageme
docker-compose down
docker-compose up -d
```

### Issue 2: Wrong port in NPM configuration

**NPM Settings should be:**

- Forward Hostname/IP: `stageme-app` (container name)
- Forward Port: `80` (NOT 3000)

The docker-compose.yml maps `3000:80`, so:

- Port 3000 is exposed to the host
- Port 80 is the internal container port
- NPM should connect to port 80 inside the container

### Issue 3: Container crashed during build

**Check logs:**

```bash
docker logs stageme-app --tail 50
```

**If you see errors, rebuild:**

```bash
cd /opt/docker/stageme
docker-compose down
docker-compose up -d --build --force-recreate
```

### Issue 4: Environment variables missing

**Symptom:** Build succeeded but app crashes at runtime

**Note:** Vite bakes env vars into the build, so if you created `.env.local` AFTER building, you need to rebuild:

```bash
cd /opt/docker/stageme
# Make sure .env.local exists with your API keys
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Step-by-Step Fix

1. **Verify container is healthy:**

   ```bash
   docker ps -a | grep stageme
   ```

   If status is "Exited" or "Restarting", check logs:

   ```bash
   docker logs stageme-app
   ```

2. **Test direct access:**

   ```bash
   curl -I http://localhost:3000
   ```

   Should return `HTTP/1.1 200 OK`

3. **Verify NPM can reach container:**

   ```bash
   docker exec -it npm-app curl http://stageme-app:80
   ```

   (Replace `npm-app` with your NPM container name)

4. **Check NPM configuration:**
   - Open NPM dashboard
   - Edit the proxy host for stageme
   - Verify:
     - **Forward Hostname/IP:** `stageme-app`
     - **Forward Port:** `80`
     - **Scheme:** `http`

5. **Restart everything:**
   ```bash
   cd /opt/docker/stageme
   docker-compose restart
   ```

## If Still Not Working

Run this comprehensive check:

```bash
echo "=== Container Status ==="
docker ps -a | grep stageme

echo -e "\n=== Container Logs (last 20 lines) ==="
docker logs stageme-app --tail 20

echo -e "\n=== Network Check ==="
docker network inspect proxy-netz | grep -A 5 stageme

echo -e "\n=== Direct Access Test ==="
curl -I http://localhost:3000

echo -e "\n=== Health Check ==="
curl http://localhost:3000/health
```

Send me the output and I can help diagnose further!
