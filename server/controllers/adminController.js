const sqlService = require('../services/sqlService');
const encryptionService = require('../services/encryptionService');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../config/settings.json');

// Helper to save settings locally (unencrypted for the file, but keys can be encrypted)
const saveSettingsLocal = (settings) => {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
};

const getSettingsLocal = () => {
    if (fs.existsSync(SETTINGS_FILE)) {
        return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
    return {};
};

exports.testSQLConnection = async (req, res) => {
    try {
        const { host, user, password, database } = req.body;
        const result = await sqlService.createConnection({ host, user, password, database });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.saveSystemSettings = async (req, res) => {
    try {
        const { firebase, sql, smtp, flags } = req.body;

        // Encrypt sensitive data
        const encryptedSQL = {
            ...sql,
            password: encryptionService.encrypt(sql.password)
        };

        const encryptedFirebase = {
            ...firebase,
            apiKey: encryptionService.encrypt(firebase.apiKey)
        };

        const settings = {
            firebase: encryptedFirebase,
            sql: encryptedSQL,
            smtp,
            flags,
            updated_at: new Date().toISOString()
        };

        // Save to local file first (to ensure we can load next time)
        saveSettingsLocal(settings);

        // Try to initialize SQL pool with new settings
        await sqlService.initPool({
            host: sql.host,
            user: sql.user,
            password: sql.password,
            database: sql.database
        });

        // Try to create the system_settings table if it doesn't exist
        try {
            await sqlService.query(`
                CREATE TABLE IF NOT EXISTS system_settings (
                    id SERIAL PRIMARY KEY,
                    firebase_config TEXT,
                    sql_config TEXT,
                    smtp_config TEXT,
                    system_flags TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Also save to DB for persistence across deployments/volumes
            await sqlService.query(
                `INSERT INTO system_settings (firebase_config, sql_config, smtp_config, system_flags) VALUES ($1, $2, $3, $4)`,
                [JSON.stringify(encryptedFirebase), JSON.stringify(encryptedSQL), JSON.stringify(smtp), JSON.stringify(flags)]
            );
        } catch (dbErr) {
            console.warn('Could not save to DB table yet:', dbErr.message);
        }

        res.json({ success: true, message: 'Settings saved and applied successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSystemSettings = async (req, res) => {
    try {
        const settings = getSettingsLocal();

        // Decrypt for UI if needed (or just mask them)
        if (settings.sql && settings.sql.password) {
            settings.sql.password = '********'; // Mask sensitive data
        }
        if (settings.firebase && settings.firebase.apiKey) {
            settings.firebase.apiKey = '********';
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
