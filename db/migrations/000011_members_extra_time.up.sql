-- table for multiple extra time for a member.
CREATE TABLE if not exists whygym.order_extra_time (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL,
    extra_time INT NOT NULL,
    reason TEXT,
    order_reference_id VARCHAR(40) NOT NULL,
    created_by INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--alter order table to add colom start_date that are nullable but have default value of current_date
ALTER TABLE whygym.members ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;


-- add a foreign key to the members table
ALTER TABLE whygym.order_extra_time ADD CONSTRAINT fk_member_id FOREIGN KEY (member_id) REFERENCES whygym.members(id);
ALTER TABLE whygym.order_extra_time ADD CONSTRAINT fk_order_reference_id FOREIGN KEY (order_reference_id) REFERENCES whygym.orders(reference_id);

-- add index to the order_reference_id column
CREATE INDEX if not exists idx_order_reference_id ON whygym.order_extra_time (order_reference_id);

CREATE UNIQUE INDEX members_unique_pending_email ON whygym.members (email) WHERE members.membership_status = 'pending';


