const express = require('express');
const router = express.Router();
const sqlService = require('../services/sqlService');
const { checkSession, authorize } = require('../middleware/auth');

router.get('/', checkSession, async (req, res) => {
    try {
        const depts = await sqlService.query('SELECT * FROM departments', []);
        res.json(depts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', checkSession, authorize(['admin']), async (req, res) => {
    try {
        const { name, code } = req.body;
        await sqlService.query(
            'INSERT INTO departments (name, code) VALUES ($1, $2)',
            [name, code]
        );
        res.status(201).json({ message: 'Department created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
