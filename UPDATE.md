# How to Update Your Deployed Website

When you've pushed code changes to GitHub and want to update your live website:

## Steps to Update

### 1. SSH into your server

```bash
ssh your-username@your-server-ip
```

### 2. Navigate to your project directory

```bash
cd /path/to/your/project
```

### 3. Pull latest code from GitHub

```bash
git pull origin main
```

### 4. Rebuild and restart containers

```bash
docker-compose up -d --build
```

This will:
- Pull the latest code
- Rebuild the Docker images
- Restart all services automatically

### 5. Verify it's working

```bash
curl http://localhost:3333/api/health
```

---

## Quick Update Command (one-liner)

```bash
cd /path/to/your/project && git pull && docker-compose up -d --build
```

---

## Troubleshooting

If the site doesn't update, try:

```bash
# Stop containers first
docker-compose down

# Then rebuild and start
docker-compose up -d --build
```

View logs if there are issues:

```bash
docker-compose logs -f
```