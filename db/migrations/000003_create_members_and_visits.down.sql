-- Drop indexes first
DROP INDEX IF EXISTS whygym.idx_visits_check_in_date;
DROP INDEX IF EXISTS whygym.idx_visits_email;
DROP INDEX IF EXISTS whygym.idx_visits_member_id;
DROP INDEX IF EXISTS whygym.idx_members_membership_status;
DROP INDEX IF EXISTS whygym.idx_members_user_id;

-- Drop tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS whygym.visits;
DROP TABLE IF EXISTS whygym.members; 