DROP INDEX IF EXISTS whygym.idx_private_coaching_member_id;

ALTER TABLE whygym.orders DROP COLUMN IF EXISTS private_coaching_id;

DROP TABLE IF EXISTS whygym.private_coaching; 