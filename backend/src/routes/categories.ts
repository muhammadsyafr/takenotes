import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const categories = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name').all(req.userId) as any[];
    res.json(categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at
    })));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, color = '#6B7280' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare('INSERT INTO categories (id, user_id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, req.userId, name, color, now, now);

    res.status(201).json({ id, name, color, createdAt: now, updatedAt: now });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, color } = req.body;
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(req.params.id);

    db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as any;
    res.json({ ...category, createdAt: category?.created_at, updatedAt: now });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;