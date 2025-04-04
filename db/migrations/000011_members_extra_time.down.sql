-- create down migration for the extra_time table
ALTER TABLE whygym.order_extra_time DROP CONSTRAINT if exists fk_member_id;
ALTER TABLE whygym.order_extra_time DROP CONSTRAINT if exists fk_order_reference_id;

-- drop the index
DROP INDEX if exists whygym.idx_order_reference_id;

DROP TABLE if exists whygym.order_extra_time;

DROP INDEX if exists members_unique_pending_email;

-- drop the start_date column
ALTER TABLE whygym.orders DROP COLUMN if exists start_date;
