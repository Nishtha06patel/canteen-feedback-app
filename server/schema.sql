CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enum for roles to ensure strict values
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Overrides Table
CREATE TABLE IF NOT EXISTS menu_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
VALUES ('admin@iar.ac.in', '$2a$10$T8Z7.B3y4g2O9O7O/1xXOOg7N/gM2.oQ9J/B6n5Y1W6k4m6q7g3.', 'admin')
ON CONFLICT (email) DO NOTHING;
