"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const init_1 = require("../db/init");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (req, res) => {
    try {
        const categories = init_1.db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name').all(req.userId);
        res.json(categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            createdAt: cat.created_at,
            updatedAt: cat.updated_at
        })));
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});
router.post('/', auth_1.authenticateToken, (req, res) => {
    try {
        const { name, color = '#6B7280' } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        init_1.db.prepare('INSERT INTO categories (id, user_id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, req.userId, name, color, now, now);
        res.status(201).json({ id, name, color, createdAt: now, updatedAt: now });
    }
    catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});
router.put('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const { name, color } = req.body;
        const now = new Date().toISOString();
        const existing = init_1.db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
        if (!existing) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const updates = [];
        const params = [];
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
        init_1.db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...params);
        const category = init_1.db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
        res.json({ ...category, createdAt: category?.created_at, updatedAt: now });
    }
    catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});
router.delete('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const result = init_1.db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map