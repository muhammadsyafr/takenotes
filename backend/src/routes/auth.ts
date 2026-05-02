import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/init';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)').run(userId, email, passwordHash);

    const token = generateToken(userId);

    res.status(201).json({ token, user: { id: userId, email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT id, email, password FROM users WHERE email = ?').get(email) as { id: string; email: string; password: string } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.userId) as { id: string; email: string; created_at: string } | undefined;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id: user.id, email: user.email, createdAt: user.created_at });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;