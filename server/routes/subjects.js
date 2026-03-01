const express = require('express');
const router = express.Router();
const sqlService = require('../services/sqlService');
const { checkSession, authorize } = require('../middleware/auth');

router.get('/', checkSession, async (req, res) => {
    try {
        const subjects = await sqlService.query('SELECT * FROM subjects', []);
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', checkSession, authorize(['admin']), async (req, res) => {
    try {
        const { name, code, faculty_id, department_id } = req.body;
        // In the PostgreSQL schema, I'll map code to a standard code column (or modify schema if missing)
        await sqlService.query(
            'INSERT INTO subjects (name, code, faculty_id, department_id) VALUES ($1, $2, $3, $4)',
            [name, code, faculty_id, department_id]
        );
        res.status(201).json({ message: 'Subject created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
