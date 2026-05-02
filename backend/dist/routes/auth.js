"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const init_1 = require("../db/init");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const existingUser = init_1.db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        init_1.db.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)').run(userId, email, passwordHash);
        const token = (0, auth_1.generateToken)(userId);
        res.status(201).json({ token, user: { id: userId, email } });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = init_1.db.prepare('SELECT id, email, password FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = (0, auth_1.generateToken)(user.id);
        res.json({ token, user: { id: user.id, email: user.email } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});
router.get('/me', auth_1.authenticateToken, (req, res) => {
    try {
        const user = init_1.db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: user.id, email: user.email, createdAt: user.created_at });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map