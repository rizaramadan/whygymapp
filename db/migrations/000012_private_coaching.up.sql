CREATE TABLE IF NOT EXISTS whygym.private_coaching (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES whygym.members(id) ON DELETE CASCADE,
    coach_type VARCHAR(20) NOT NULL,
    number_of_sessions INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    notes TEXT,
    additional_data JSON,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE whygym.orders ADD COLUMN private_coaching_id INTEGER REFERENCES whygym.private_coaching(id) ON DELETE CASCADE;

create index idx_private_coaching_member_id on whygym.private_coaching (member_id);
