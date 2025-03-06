-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS whygym.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert default roles if they don't exist
INSERT INTO whygym.roles (name) 
VALUES ('admin'), ('user')
ON CONFLICT (name) DO NOTHING;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS whygym.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS whygym.user_roles (
    user_id INTEGER REFERENCES whygym.users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES whygym.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_username ON whygym.users(username);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON whygym.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON whygym.user_roles(role_id);
