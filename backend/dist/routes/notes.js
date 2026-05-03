"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const init_1 = require("../db/init");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (req, res) => {
    try {
        const { search, categoryId, tagId } = req.query;
        let query = `
      SELECT n.*, 
        GROUP_CONCAT(c.id) as category_ids,
        GROUP_CONCAT(t.id) as tag_ids
      FROM notes n
      LEFT JOIN note_categories nc ON n.id = nc.note_id
      LEFT JOIN categories c ON nc.category_id = c.id
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.user_id = ? AND n.trashed_at IS NULL
    `;
        const params = [req.userId];
        if (categoryId) {
            query += ` AND n.id IN (SELECT note_id FROM note_categories WHERE category_id = ?)`;
            params.push(categoryId);
        }
        if (tagId) {
            query += ` AND n.id IN (SELECT note_id FROM note_tags WHERE tag_id = ?)`;
            params.push(tagId);
        }
        if (search) {
            query += ` AND n.text LIKE ?`;
            params.push(`%${search}%`);
        }
        query += ` GROUP BY n.id ORDER BY n.updated_at DESC`;
        const notes = init_1.db.prepare(query).all(...params);
        const formattedNotes = notes.map(note => ({
            ...note,
            categoryIds: note.category_ids ? note.category_ids.split(',') : [],
            tagIds: note.tag_ids ? note.tag_ids.split(',') : [],
            createdAt: note.created_at,
            updatedAt: note.updated_at
        }));
        res.json(formattedNotes);
    }
    catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to get notes' });
    }
});
router.post('/', auth_1.authenticateToken, (req, res) => {
    try {
        const { text = '', categoryIds = [], tagIds = [] } = req.body;
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        init_1.db.prepare('INSERT INTO notes (id, user_id, text, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, req.userId, text, now, now);
        if (categoryIds.length > 0) {
            const insertCategory = init_1.db.prepare('INSERT INTO note_categories (note_id, category_id) VALUES (?, ?)');
            categoryIds.forEach((catId) => insertCategory.run(id, catId));
        }
        if (tagIds.length > 0) {
            const insertTag = init_1.db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');
            tagIds.forEach((tagId) => insertTag.run(id, tagId));
        }
        const note = init_1.db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
        res.status(201).json({ ...note, categoryIds, tagIds, createdAt: now, updatedAt: now });
    }
    catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});
// Trash routes (must come before /:id routes)
router.get('/trash', auth_1.authenticateToken, (req, res) => {
    try {
        const notes = init_1.db.prepare(`
      SELECT n.*, 
        GROUP_CONCAT(c.id) as category_ids,
        GROUP_CONCAT(t.id) as tag_ids
      FROM notes n
      LEFT JOIN note_categories nc ON n.id = nc.note_id
      LEFT JOIN categories c ON nc.category_id = c.id
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.user_id = ? AND n.trashed_at IS NOT NULL
      GROUP BY n.id
      ORDER BY n.trashed_at DESC
    `).all(req.userId);
        const formattedNotes = notes.map(note => ({
            ...note,
            categoryIds: note.category_ids ? note.category_ids.split(',') : [],
            tagIds: note.tag_ids ? note.tag_ids.split(',') : [],
            createdAt: note.created_at,
            updatedAt: note.updated_at,
            trashedAt: note.trashed_at
        }));
        res.json(formattedNotes);
    }
    catch (error) {
        console.error('Get trash error:', error);
        res.status(500).json({ error: 'Failed to get trash' });
    }
});
router.post('/:id/restore', auth_1.authenticateToken, (req, res) => {
    try {
        const result = init_1.db.prepare('UPDATE notes SET trashed_at = NULL WHERE id = ? AND user_id = ? AND trashed_at IS NOT NULL').run(req.params.id, req.userId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Restore note error:', error);
        res.status(500).json({ error: 'Failed to restore note' });
    }
});
router.delete('/:id/permanent', auth_1.authenticateToken, (req, res) => {
    try {
        const result = init_1.db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ? AND trashed_at IS NOT NULL').run(req.params.id, req.userId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Permanent delete note error:', error);
        res.status(500).json({ error: 'Failed to permanently delete note' });
    }
});
// Note routes
router.get('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const note = init_1.db.prepare(`
      SELECT n.*, 
        GROUP_CONCAT(c.id) as category_ids,
        GROUP_CONCAT(t.id) as tag_ids
      FROM notes n
      LEFT JOIN note_categories nc ON n.id = nc.note_id
      LEFT JOIN categories c ON nc.category_id = c.id
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.id = ? AND n.user_id = ? AND n.trashed_at IS NULL
      GROUP BY n.id
    `).get(req.params.id, req.userId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({
            ...note,
            categoryIds: note.category_ids ? note.category_ids.split(',') : [],
            tagIds: note.tag_ids ? note.tag_ids.split(',') : [],
            createdAt: note.created_at,
            updatedAt: note.updated_at
        });
    }
    catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({ error: 'Failed to get note' });
    }
});
router.put('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const { text, categoryIds, tagIds } = req.body;
        const now = new Date().toISOString();
        const existingNote = init_1.db.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ? AND trashed_at IS NULL').get(req.params.id, req.userId);
        if (!existingNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (text !== undefined) {
            init_1.db.prepare('UPDATE notes SET text = ?, updated_at = ? WHERE id = ?').run(text, now, req.params.id);
        }
        if (categoryIds !== undefined) {
            init_1.db.prepare('DELETE FROM note_categories WHERE note_id = ?').run(req.params.id);
            if (categoryIds.length > 0) {
                const insertCategory = init_1.db.prepare('INSERT INTO note_categories (note_id, category_id) VALUES (?, ?)');
                categoryIds.forEach((catId) => insertCategory.run(req.params.id, catId));
            }
        }
        if (tagIds !== undefined) {
            init_1.db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(req.params.id);
            if (tagIds.length > 0) {
                const insertTag = init_1.db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');
                tagIds.forEach((tagId) => insertTag.run(req.params.id, tagId));
            }
        }
        const note = init_1.db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
        res.json({ ...note, createdAt: note?.created_at, updatedAt: now });
    }
    catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});
router.delete('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const now = new Date().toISOString();
        const result = init_1.db.prepare('UPDATE notes SET trashed_at = ? WHERE id = ? AND user_id = ? AND trashed_at IS NULL').run(now, req.params.id, req.userId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});
exports.default = router;
//# sourceMappingURL=notes.js.map