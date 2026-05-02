import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const tags = db.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name').all(req.userId) as any[];
    res.json(tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.created_at,
      updatedAt: tag.updated_at
    })));
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
});

router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, color = '#3B82F6' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare('INSERT INTO tags (id, user_id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, req.userId, name, color, now, now);

    res.status(201).json({ id, name, color, createdAt: now, updatedAt: now });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, color } = req.body;
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT id FROM tags WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Tag not found' });
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

    db.prepare(`UPDATE tags SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id) as any;
    res.json({ ...tag, createdAt: tag?.created_at, updatedAt: now });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

router.post('/note/:noteId', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { tagIds } = req.body;

    const note = db.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').get(req.params.noteId, req.userId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (Array.isArray(tagIds)) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
      tagIds.forEach((tagId: string) => insertTag.run(req.params.noteId, tagId));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Add tags to note error:', error);
    res.status(500).json({ error: 'Failed to add tags to note' });
  }
});

router.delete('/note/:noteId/:tagId', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const note = db.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').get(req.params.noteId, req.userId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    db.prepare('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?').run(req.params.noteId, req.params.tagId);

    res.status(204).send();
  } catch (error) {
    console.error('Remove tag from note error:', error);
    res.status(500).json({ error: 'Failed to remove tag from note' });
  }
});

export default router;