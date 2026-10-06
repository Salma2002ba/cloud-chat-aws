import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
});

pool.on('connect', () => {
    console.log('✅ Auth Service: Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Auth Service: Unexpected error on idle client', err);
    process.exit(-1);
});

export const initDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `);
        console.log('✅ Auth Service: Database tables initialized');
    } catch (error) {
        console.error('❌ Auth Service: Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
};
