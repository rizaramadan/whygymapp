-- Create create_user_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS whygym.create_user_requests (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- status can be 'pending', 'approved', 'rejected'
    approved_by INTEGER REFERENCES whygym.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 