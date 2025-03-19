CREATE TABLE IF NOT EXISTS whygym.darisinicom_log (
    id SERIAL PRIMARY KEY,
    reference_id VARCHAR(40) NOT NULL,
    notes TEXT,
    additional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

create index idx_darisinicom_log_reference_id on whygym.darisinicom_log (reference_id);
