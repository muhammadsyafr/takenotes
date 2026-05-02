# TakeNote Development Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git

---

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd takenote
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:4444

---

## Project Structure

```
takenote/
├── backend/           # Express + SQLite API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── middleware/# Auth middleware
│   │   └── db/        # Database initialization
│   └── dist/          # Compiled JavaScript
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/# React components
│   │   ├── store/     # Zustand state management
│   │   └── lib/       # API client
│   └── dist/          # Built static files
├── nginx/             # Nginx config for production
├── docker-compose.yml
├── .env              # Environment variables
├── DEPLOY.md         # Deployment guide
└── DEV.md            # This file
```

---

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (auto-reload) |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run production build |
| `npm run db:init` | Initialize database |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Environment Variables

### Backend (.env)

Create a `.env` file in the project root:

```env
PORT=4444
NODE_ENV=development
JWT_SECRET=dev-secret-key
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/takenote.db
```

### Frontend

The frontend uses Vite's proxy in development (configured in `vite.config.ts`).

---

## Development Workflow

### Making Changes

1. **Backend changes**: Edit files in `backend/src/`
   - Routes: `backend/src/routes/`
   - Database: `backend/src/db/`
   - Middleware: `backend/src/middleware/`

2. **Frontend changes**: Edit files in `frontend/src/`
   - Components: `frontend/src/components/`
   - Store: `frontend/src/store/`
   - Styles: `frontend/src/index.css`

3. **Auto-reload**: Both servers auto-reload on file changes

### Testing API

```bash
# Register a user
curl -X POST http://localhost:4444/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:4444/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get notes (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4444/api/notes
```

---

## Database

### SQLite Location

Development: `data/takenote.db` (in project root)

### Reset Database

```bash
# Stop the server first
rm -rf data/takenote.db
# Restart - database will be recreated
```

### View Database

```bash
# Using sqlite3 CLI
sqlite3 data/takenote.db

# List tables
sqlite3 data/takenote.db ".tables"

# Query notes
sqlite3 data/takenote.db "SELECT * FROM notes;"
```

---

## Code Style

- **Backend**: TypeScript strict mode
- **Frontend**: React + TypeScript
- **Formatting**: Prettier (configured in both projects)
- **Linting**: ESLint

```bash
# Format code
cd frontend && npm run lint -- --fix
cd backend && npx eslint src --fix
```

---

## Adding New Features

### Backend

1. Create route in `backend/src/routes/`
2. Add controller logic
3. Export and register in `backend/src/index.ts`

```typescript
// Example: backend/src/routes/example.ts
import { Router } from 'express';

const router = Router();

router.get('/example', (req, res) => {
  res.json({ message: 'Hello' });
});

export default router;
```

### Frontend

1. Create component in `frontend/src/components/`
2. Add to store if needed in `frontend/src/store/`
3. Update API client in `frontend/src/lib/api.ts`

---

## Debugging

### Backend

```bash
# View server logs
npm run dev

# Check console.log output in terminal
```

### Frontend

```bash
# View browser console (F12)
# Use React DevTools extension
```

### Network

```bash
# Check API calls
# Open Browser DevTools > Network tab
# Filter by fetch/XHR
```

---

## Common Issues

### Port already in use

```bash
# Find process using port
lsof -i :4444  # backend
lsof -i :5173  # frontend

# Kill process
kill -9 <PID>
```

### Database locked

```bash
# Close any database connections
# Restart the backend server
```

### Module not found

```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

### TypeScript errors

```bash
# Check tsconfig.json
# Verify all types are correct
cd backend && npm run build
```

---

## Production Build (Local)

Test the full Docker stack locally:

```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# Test at http://localhost:3333
```

---

## Learning Resources

- [React Docs](https://react.dev)
- [Express Guide](https://expressjs.com/)
- [SQLite Tutorial](https://www.sqlite.org/lang.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Vite Guide](https://vitejs.dev/guide/)

---

## Commands Summary

```bash
# Setup
npm install                    # Install all deps
mkdir -p data                  # Create data folder

# Development
cd backend && npm run dev     # Start backend (port 4444)
cd frontend && npm run dev   # Start frontend (port 5173)

# Build
cd backend && npm run build  # Compile TS
cd frontend && npm run build # Build React app

# Docker
docker-compose up -d --build # Deploy locally

# Database
rm -rf data/takenote.db      # Reset database
sqlite3 data/takenote.db    # Open database CLI
```

---

## Troubleshooting Checklist

- [ ] Node.js version 18+ installed
- [ ] Dependencies installed in both backend and frontend
- [ ] .env file exists in project root
- [ ] Data directory created
- [ ] Ports 4444 and 5173 are free
- [ ] Database file has correct permissions

---

## Next Steps

1. Explore the codebase
2. Make a small change
3. Run the app locally
4. Test the feature
5. Read the DEPLOY.md for production deployment