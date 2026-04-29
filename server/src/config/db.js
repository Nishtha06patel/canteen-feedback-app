import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = process.env.DATABASE_URL 
    ? { 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Railway often requires SSL
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
      };

const pool = new Pool(poolConfig);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle database client:', err);
});

// Auto-run schema.sql on startup
const initDatabase = async () => {
    try {
        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('Database schema successfully initialized/verified.');
    } catch (err) {
        console.error('Failed to initialize database schema:', err);
    }
};

initDatabase();

export const query = (text, params) => pool.query(text, params);
export default pool;
