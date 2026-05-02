# TakeNote

A modern, developer-focused note-taking application with Markdown support, tags, and categories.

## Features

- **Markdown Editor** - IDE-like plain text editor with syntax highlighting
- **Live Preview** - Toggle between editor and preview mode
- **Tags & Categories** - Organize notes with tags and categories
- **Search** - Full-text search across all notes
- **Multi-user** - JWT-based authentication
- **Export** - Download all notes as ZIP
- **Dark/Light Theme** - Toggle between dark and light mode

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + CodeMirror 6
- **Backend**: Node.js + Express + TypeScript + SQLite
- **Container**: Docker + Docker Compose + Nginx

## Quick Start

### Development

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Access the app at `http://localhost:5173`

### Docker Deployment

1. Create the data directory:
   ```bash
   mkdir -p data
   ```

2. Update `.env` with your settings:
   ```env
   PORT=5000
   JWT_SECRET=your-secure-random-secret
   FRONTEND_URL=http://localhost:8080
   DATABASE_PATH=/app/data/takenote.db
   ```

3. Build and run:
   ```bash
   docker-compose up -d --build
   ```

4. Access the app at `http://localhost`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/notes | Get all notes |
| POST | /api/notes | Create note |
| PUT | /api/notes/:id | Update note |
| DELETE | /api/notes/:id | Delete note |
| GET | /api/categories | Get categories |
| POST | /api/categories | Create category |
| GET | /api/tags | Get tags |
| POST | /api/tags | Create tag |

## Project Structure

```
takenote/
├── backend/           # Express + SQLite API
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── middleware/# Auth middleware
│   │   └── db/        # Database initialization
│   └── Dockerfile
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/# UI components
│   │   ├── store/     # Zustand state
│   │   └── lib/       # API client
│   └── Dockerfile
├── nginx/             # Nginx reverse proxy
├── docker-compose.yml
└── .env
```

## License

MIT