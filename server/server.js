const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const admin = require('firebase-admin');
const serviceAccount = require('../eduslide-yeahzz-firebase-adminsdk-fbsvc-46c44b4d0c.json');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
} catch (e) {
    console.error('Firebase Admin init failed:', e);
}

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const subjectRoutes = require('./routes/subjects');
const presentationRoutes = require('./routes/presentations');
const deptRoutes = require('./routes/departments');
const qrRoutes = require('./routes/qrRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/presentations', presentationRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));


// Root route
app.get('/', (req, res) => {
    res.send('EduSlide Pro API is running...');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const sqlService = require('./services/sqlService');
const fs = require('fs');

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Auto-initialize SQL pool if settings exist
    const settingsPath = path.join(__dirname, 'config/settings.json');
    if (process.env.DATABASE_URL) {
        try {
            await sqlService.initPool({ connectionString: process.env.DATABASE_URL });
            console.log('SQL Pool initialized from DATABASE_URL environment variable.');
        } catch (err) {
            console.error('Failed to init SQL pool from DATABASE_URL:', err.message);
        }
    } else if (fs.existsSync(settingsPath)) {
        try {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            if (settings.sql) {
                const encryptionService = require('./services/encryptionService');
                const decryptedConfig = {
                    ...settings.sql,
                    password: encryptionService.decrypt(settings.sql.password)
                };
                await sqlService.initPool(decryptedConfig);
                console.log('SQL Pool initialized from saved settings.');
            }
        } catch (err) {
            console.error('Failed to auto-init SQL pool:', err.message);
        }
    }
});
