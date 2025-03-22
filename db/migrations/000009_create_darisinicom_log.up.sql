CREATE TABLE IF NOT EXISTS whygym.orders_status_log (
    id SERIAL PRIMARY KEY,
    reference_id VARCHAR(40) NOT NULL,
    order_status VARCHAR(40) NOT NULL DEFAULT 'failed',
    notes TEXT,
    additional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

create index idx_orders_status_log_reference_id on whygym.orders_status_log (reference_id);
