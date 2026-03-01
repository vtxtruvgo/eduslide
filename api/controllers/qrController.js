const sqlService = require('../services/sqlService');
const crypto = require('crypto');
const admin = require('firebase-admin');

// 1. Generate a new QR Session (UUID) for Desktop Login
exports.generateSession = async (req, res) => {
    try {
        const uuid = crypto.randomUUID();
        await sqlService.query(
            "INSERT INTO qr_sessions (uuid, status) VALUES ($1, 'pending')",
            [uuid]
        );
        res.json({ uuid });
    } catch (error) {
        console.error('Error generating QR session:', error);
        res.status(500).json({ error: 'Server error generating QR session' });
    }
};

// 2. Poll the status of a QR Session
exports.checkStatus = async (req, res) => {
    try {
        const { uuid } = req.params;
        const sessions = await sqlService.query(
            "SELECT status, custom_token FROM qr_sessions WHERE uuid = $1",
            [uuid]
        );

        if (sessions.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const session = sessions[0];
        res.json({ status: session.status, custom_token: session.custom_token });
    } catch (error) {
        console.error('Error checking QR status:', error);
        res.status(500).json({ error: 'Server error checking status' });
    }
};

// 3. Approve a QR Session (Called from Authenticated Mobile App)
exports.approveSession = async (req, res) => {
    try {
        const { uuid } = req.body;
        // User is already authenticated via auth.js middleware
        const facultyId = req.user.userId;
        const firebaseUid = req.user.uid;
        const role = req.user.role;

        if (role !== 'faculty' && role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Only faculty/admin can approve logins' });
        }

        // Verify the session is still pending
        const sessions = await sqlService.query(
            "SELECT * FROM qr_sessions WHERE uuid = $1 AND status = 'pending'",
            [uuid]
        );

        if (sessions.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired QR session' });
        }

        // Generate Custom Token using Firebase Admin SDK
        const customToken = await admin.auth().createCustomToken(firebaseUid);

        // Update session in DB
        await sqlService.query(
            "UPDATE qr_sessions SET status = 'approved', custom_token = $1 WHERE uuid = $2",
            [customToken, uuid]
        );

        res.json({ message: 'Login approved successfully!' });
    } catch (error) {
        console.error('Error approving session:', error);
        res.status(500).json({ error: 'Server error approving session' });
    }
};
