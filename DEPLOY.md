# TakeNote Deployment Guide

## Prerequisites

- Docker installed on your server
- Open ports: 3333 (or your chosen port)
- SSH access to your VPS

---

## Pre-Deployment Checklist

### Step 1: Generate JWT Secret

Generate a secure secret for JWT authentication:

```bash
openssl rand -base64 32
```

### Step 2: Configure Environment Variables

Edit the `.env` file with your settings:

```env
# Backend
PORT=4444
NODE_ENV=production
JWT_SECRET=your-generated-secret-here
FRONTEND_URL=http://your-server-ip:3333

# Database - SQLite database file path
DATABASE_PATH=/app/data/takenote.db
```

**Important:**
- Replace `JWT_SECRET` with the generated secret from Step 1
- Replace `your-server-ip` with your actual server IP or domain

### Step 3: Create Data Directory

```bash
mkdir -p data
```

This directory will store the SQLite database file.

### Step 4: Verify Port Availability

```bash
# Check if port 3333 is already in use
lsof -i :3333

# If something is using it, find and stop it
# Or change the port in docker-compose.yml
```

---

## Deployment Commands

### Build and Start

```bash
docker-compose up -d --build
```

### Verify Deployment

```bash
# Check container status
docker ps

# Expected output:
# CONTAINER ID   IMAGE          STATUS
# xxx            takenote-nginx  Up
# xxx            takenote-frontend Up
# xxx            takenote-backend Up
```

### Test API Health

```bash
curl http://localhost:3333/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-05-02T..."}
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

---

## Access the Application

- **URL**: `http://your-server-ip:3333`
- **API**: `http://your-server-ip:3333/api`

---

## Common Commands

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start containers (detached) |
| `docker-compose up -d --build` | Rebuild and start |
| `docker-compose down` | Stop and remove containers |
| `docker-compose restart` | Restart all services |
| `docker-compose logs -f` | Follow logs |
| `docker-compose logs -f backend` | Backend logs only |

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs

# Common issues:
# - Port already in use
# - Missing .env file
# - Database permission issues
```

### Database issues

```bash
# Check if data folder exists
ls -la data/

# Recreate database (warning: loses all data)
rm -rf data/*
```

### Can't access the app

```bash
# Check if ports are exposed
docker ps

# Check firewall
sudo ufw status
sudo ufw allow 3333/tcp
```

### Rebuild after changes

```bash
docker-compose down
docker-compose up -d --build
```

---

## Backup and Restore

### Backup Database

```bash
# Copy the SQLite database file
cp data/takenote.db ./backup-takenote-$(date +%Y%m%d).db
```

### Restore Database

```bash
# Stop containers
docker-compose down

# Restore backup
cp ./backup-takenote-20260101.db data/takenote.db

# Start containers
docker-compose up -d
```

---

## Updating the Application

```bash
# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker-compose up -d --build
```

---

## Security Notes

1. **Change JWT_SECRET** - Use a unique, strong secret
2. **Use HTTPS** - Consider using a reverse proxy with SSL (like Traefik or Caddy)
3. **Firewall** - Only expose port 3333
4. **Regular backups** - Backup the database regularly
5. **Monitor logs** - Check logs periodically for errors

---

## Port Configuration

| Service | Internal Port | External Port | URL |
|---------|---------------|----------------|-----|
| Nginx | 80 | 3333 | `http://ip:3333` |
| Frontend | 80 | (internal) | - |
| Backend | 4444 | (internal) | - |

To change external port, edit `ports` in `docker-compose.yml`:

```yaml
nginx:
  ports:
    - "8080:80"  # Change 3333 to 8080
```