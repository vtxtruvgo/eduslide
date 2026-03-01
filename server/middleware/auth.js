const admin = require('firebase-admin');
const sqlService = require('../services/sqlService');

const checkSession = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized. Missing token.' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Fetch user role from our Neon DB to attach to req.user
        const users = await sqlService.query('SELECT * FROM users WHERE email = $1', [decodedToken.email]);

        req.user = {
            ...decodedToken,
            role: users.length > 0 ? users[0].role : 'student', // default fallback
            userId: users.length > 0 ? users[0].id : null
        };

        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
        }

        next();
    };
};

module.exports = { checkSession, authorize };
