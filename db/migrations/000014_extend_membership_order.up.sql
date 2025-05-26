CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE whygym.extension_orders (
    id serial PRIMARY KEY,
    member_id int NOT NULL REFERENCES whygym.members(id),
    reference_id VARCHAR(50) NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    member_email VARCHAR(255) NOT NULL,
    duration_days INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on reference_id for faster lookups
CREATE INDEX idx_extension_orders_reference_id ON whygym.extension_orders(reference_id);

-- Create an index on member_email for faster lookups
CREATE INDEX idx_extension_orders_member_email ON whygym.extension_orders(member_email);

-- Create an index on member_id for faster lookups
CREATE INDEX idx_extension_orders_member_id ON whygym.extension_orders(member_id);

CREATE TABLE IF NOT EXISTS whygym.extension_orders_status_log (
    id SERIAL PRIMARY KEY,
    reference_id VARCHAR(40) NOT NULL,
    extension_order_status VARCHAR(40) NOT NULL DEFAULT 'failed',
    notes TEXT,
    additional_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on reference_id for faster lookups
CREATE INDEX idx_extension_orders_status_log_reference_id ON whygym.extension_orders_status_log(reference_id);

alter table whygym.order_extra_time drop constraint fk_order_reference_id;
