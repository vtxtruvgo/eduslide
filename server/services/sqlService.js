const { Pool, Client } = require('pg');

class SQLService {
    constructor() {
        this.pool = null;
    }

    async createConnection(config) {
        try {
            const client = new Client({
                connectionString: config.connectionString,
                ssl: { rejectUnauthorized: false }
            });
            await client.connect();
            await client.query('SELECT 1');
            await client.end();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async initPool(config) {
        if (this.pool) {
            await this.pool.end();
        }
        this.pool = new Pool({
            connectionString: config.connectionString,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000
        });
        return this.pool;
    }

    async query(sql, params) {
        if (!this.pool) {
            throw new Error('Database pool not initialized. Configure SQL in Admin Panel or Check connection string.');
        }
        const result = await this.pool.query(sql, params);
        return result.rows; // Return rows for compatibility
    }
}

module.exports = new SQLService();
