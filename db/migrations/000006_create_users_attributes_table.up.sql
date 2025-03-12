CREATE TABLE whygym.users_attributes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES whygym.users(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_users_attributes_user_id ON whygym.users_attributes(user_id);
CREATE INDEX idx_users_attributes_key ON whygym.users_attributes(key);
CREATE INDEX idx_users_attributes_user_id_key ON whygym.users_attributes(user_id, key);
CREATE UNIQUE INDEX idx_users_attributes_user_id_key_unique ON whygym.users_attributes(user_id, key);
CREATE INDEX idx_members_pending_email ON whygym.members (email) WHERE membership_status = 'PENDING';
