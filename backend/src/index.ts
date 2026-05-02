import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './db/init';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import categoriesRoutes from './routes/categories';
import tagsRoutes from './routes/tags';

const envPath = path.resolve(process.cwd(), '.env');
const envPathBackup = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: fs.existsSync(envPath) ? envPath : envPathBackup });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

initializeDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tags', tagsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;