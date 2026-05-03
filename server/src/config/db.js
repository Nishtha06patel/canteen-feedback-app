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

        // Data Migration: Populate analytics columns from existing JSON messages if they are null
        await pool.query(`
            UPDATE feedbacks 
            SET 
                rating = CASE 
                    WHEN rating IS NULL AND message ~ '^\{.*\}$' THEN (message::json->>'stars')::integer 
                    ELSE rating 
                END,
                feedback_type = CASE 
                    WHEN feedback_type IS NULL AND message ~ '^\{.*\}$' THEN COALESCE(message::json->>'type', 'suggestion') 
                    ELSE feedback_type 
                END,
                item_name = CASE 
                    WHEN item_name IS NULL AND message ~ '^\{.*\}$' THEN message::json->>'mealItem' 
                    ELSE item_name 
                END
            WHERE rating IS NULL OR feedback_type IS NULL;
        `).catch(err => console.log('Non-critical: Existing data migration skipped or failed (likely empty or non-JSON messages).'));

        // Ensure expires_at column exists in messages
        await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'expires_at') THEN
                    ALTER TABLE messages ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
                END IF;
            END $$;
        `).catch(err => console.error('Failed to migrate expires_at column:', err));

    } catch (err) {
        console.error('Failed to initialize database schema:', err);
    }
};

initDatabase();

export const query = (text, params) => pool.query(text, params);
export default pool;
