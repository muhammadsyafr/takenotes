import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const scratchpad = db.prepare('SELECT * FROM scratchpads WHERE user_id = ?').get(req.userId) as any;
    
    if (!scratchpad) {
      const id = uuidv4();
      const now = new Date().toISOString();
      db.prepare('INSERT INTO scratchpads (id, user_id, text, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, req.userId, '', now, now);
      res.json({ text: '', updatedAt: now });
      return;
    }
    
    res.json({ text: scratchpad.text, updatedAt: scratchpad.updated_at });
  } catch (error) {
    console.error('Get scratchpad error:', error);
    res.status(500).json({ error: 'Failed to get scratchpad' });
  }
});

router.put('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    const now = new Date().toISOString();
    
    const existing = db.prepare('SELECT id FROM scratchpads WHERE user_id = ?').get(req.userId) as any;
    
    if (existing) {
      db.prepare('UPDATE scratchpads SET text = ?, updated_at = ? WHERE user_id = ?').run(text, now, req.userId);
    } else {
      const id = uuidv4();
      db.prepare('INSERT INTO scratchpads (id, user_id, text, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, req.userId, text, now, now);
    }
    
    res.json({ text, updatedAt: now });
  } catch (error) {
    console.error('Update scratchpad error:', error);
    res.status(500).json({ error: 'Failed to update scratchpad' });
  }
});

export default router;