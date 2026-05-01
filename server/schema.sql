-- Define Enum for roles to ensure strict values
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'staff');
EXCEPTION
    WHEN duplicate_object THEN 
        -- If enum exists, try to add staff if it doesn't exist
        BEGIN
            ALTER TYPE user_role ADD VALUE 'staff';
        EXCEPTION
            WHEN duplicate_object THEN null;
        END;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    is_blocked BOOLEAN DEFAULT false,
    blocked_at TIMESTAMP WITH TIME ZONE,
    blocked_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Safely add blocking columns to users table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_blocked') THEN
        ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'blocked_at') THEN
        ALTER TABLE users ADD COLUMN blocked_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'blocked_by') THEN
        ALTER TABLE users ADD COLUMN blocked_by UUID REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
    END IF;
END $$;

-- Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Safely add status and analytics columns to existing feedbacks table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks' AND column_name = 'status') THEN
        ALTER TABLE feedbacks ADD COLUMN status VARCHAR(20) DEFAULT 'Open';
    END IF;

    -- Add Analytics columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks' AND column_name = 'rating') THEN
        ALTER TABLE feedbacks ADD COLUMN rating INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks' AND column_name = 'feedback_type') THEN
        ALTER TABLE feedbacks ADD COLUMN feedback_type VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks' AND column_name = 'item_name') THEN
        ALTER TABLE feedbacks ADD COLUMN item_name VARCHAR(255);
    END IF;
END $$;

-- Menu Overrides Table
CREATE TABLE IF NOT EXISTS menu_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_overrides_date ON menu_overrides(date);

-- Insert Default Admin (Password should be changed immediately!)
-- The hash below corresponds to 'IARcanteen' using bcrypt (salt rounds: 10)
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@iar.ac.in', '$2b$10$pd/4yXaa7lLJuxKmJwz8lugqlyKITpHQ00M/BIS2U1hGF6HBcZ5v2', 'admin')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
