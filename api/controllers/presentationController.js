const sqlService = require('../services/sqlService');
const transporter = require('../config/mailer');

exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, description, subject_id } = req.body;
        // In the next step, req.file.path from cloudinary will be used. 
        // For now, assume req.file.path since we will set up Cloudinary multer.
        const file_url = req.file.path || req.file.filename;
        const student_id = req.user.userId;

        const presentations = await sqlService.query(
            'INSERT INTO presentations (subject_id, student_id, title, description, file_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [subject_id, student_id, title, description, file_url, 'pending']
        );

        res.status(201).json({ message: 'Presentation uploaded successfully', id: presentations[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const { role, userId } = req.user;
        let queryStr = 'SELECT p.*, s.name as subject_name, u.name as student_name FROM presentations p LEFT JOIN subjects s ON p.subject_id = s.id LEFT JOIN users u ON p.student_id = u.id';
        let queryParams = [];

        if (role === 'student') {
            queryStr += ' WHERE p.student_id = $1';
            queryParams.push(userId);
        } else if (role === 'faculty') {
            // Fetch presentations for subjects taught by this faculty
            queryStr += ' WHERE s.faculty_id = $1';
            queryParams.push(userId);
        }

        queryStr += ' ORDER BY p.submitted_at DESC';

        const presentations = await sqlService.query(queryStr, queryParams);
        res.json(presentations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const presentations = await sqlService.query('SELECT * FROM presentations WHERE id = $1', [req.params.id]);

        if (presentations.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }

        res.json(presentations[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        await sqlService.query('UPDATE presentations SET status = $1 WHERE id = $2', [status, id]);

        // Fetch presentation to notify student
        const presentations = await sqlService.query('SELECT * FROM presentations WHERE id = $1', [id]);
        if (presentations.length > 0) {
            const presentation = presentations[0];

            // Fetch user data
            const users = await sqlService.query('SELECT * FROM users WHERE id = $1', [presentation.student_id]);

            if (users.length > 0) {
                const user = users[0];

                // Log notification
                await sqlService.query(
                    'INSERT INTO notifications (user_id, message, is_read) VALUES ($1, $2, $3)',
                    [presentation.student_id, `Your presentation "${presentation.title}" has been ${status}.`, false]
                );

                // Send email
                try {
                    await transporter.sendMail({
                        from: process.env.SMTP_USER,
                        to: user.email,
                        subject: `Presentation ${status.toUpperCase()}`,
                        text: `Hello ${user.name}, your presentation "${presentation.title}" has been ${status}.`
                    });
                } catch (emailErr) {
                    console.error('Email sending failed:', emailErr);
                }
            }
        }

        res.json({ message: `Presentation status updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
