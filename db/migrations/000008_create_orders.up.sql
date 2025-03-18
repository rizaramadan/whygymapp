CREATE TABLE IF NOT EXISTS whygym.orders (
    id SERIAL PRIMARY KEY,
    price DECIMAL(10, 0) NOT NULL,
    reference_id VARCHAR(40) NOT NULL DEFAULT uuid_generate_v4()::text,
    member_id INTEGER REFERENCES whygym.members(id) ON DELETE CASCADE,
    payment_method VARCHAR(32) NOT NULL DEFAULT '',
    url VARCHAR(255) NOT NULL DEFAULT '',
    order_status VARCHAR(32) NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    additional_info JSONB
);

create unique index idx_orders_reference_id on whygym.orders (reference_id);
create index idx_orders_member_id on whygym.orders (member_id);
create index idx_orders_order_status on whygym.orders (order_status);

