const sqlService = require('../services/sqlService');

// This endpoint is called from the frontend after successful Firebase Auth 
// to ensure the user exists in our Neon DB.
exports.syncUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name } = req.body;
        const email = req.user.email;

        // Check if user exists in PostgreSQL
        const existingUsers = await sqlService.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUsers.length === 0) {
            // New user, insert into Neon DB
            const result = await sqlService.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
                [name || email.split('@')[0], email, 'firebase_managed', 'student']
            );
            return res.status(201).json({ message: 'User created in DB', user: result[0] });
        }

        res.status(200).json({ message: 'User already synced', user: existingUsers[0] });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const users = await sqlService.query('SELECT * FROM users WHERE email = $1', [req.user.email]);
        if (users.length > 0) {
            res.json(users[0]);
        } else {
            res.status(404).json({ error: 'User not found in DB' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};
