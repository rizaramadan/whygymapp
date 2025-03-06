CREATE TABLE IF NOT EXISTS whygym.members (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100),
    nickname VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(20),     
    membership_status VARCHAR(20) NOT NULL DEFAULT 'active',
    notes TEXT,
    additional_data JSON,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Create visits table
CREATE TABLE IF NOT EXISTS whygym.visits (
    id BIGSERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES whygym.members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    email VARCHAR(100),
    pic_url VARCHAR(255) NOT NULL,    
    notes TEXT,
    additional_data JSON
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_members_user_id ON whygym.members(email);
CREATE INDEX IF NOT EXISTS idx_members_membership_status ON whygym.members(membership_status);
CREATE INDEX IF NOT EXISTS idx_visits_member_id ON whygym.visits(member_id);
CREATE INDEX IF NOT EXISTS idx_visits_email ON whygym.visits(email);
CREATE INDEX IF NOT EXISTS idx_visits_check_in_date ON whygym.visits (check_in_date);
