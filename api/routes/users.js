const express = require('express');
const router = express.Router();
const sqlService = require('../services/sqlService');
const { checkSession, authorize } = require('../middleware/auth');

router.get('/', checkSession, authorize(['admin']), async (req, res) => {
    try {
        const users = await sqlService.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', []);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', checkSession, authorize(['admin']), async (req, res) => {
    try {
        await sqlService.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/notifications', checkSession, async (req, res) => {
    try {
        const notifications = await sqlService.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.userId] // Using userId from decoded and synced token
        );
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
