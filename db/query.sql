/*
query that returns all users with their 
{
      id: 1,
      username: 'john',
      password: 'changeme',
      roles: [Role.Admin],
    },
    {
      id: 2,
      username: 'maria',
      password: 'guess',
      roles: [Role.User],
    }
*/

-- name: GetAllUsersRoles :many
SELECT
    u.id,
    u.username,
    u.password,
    u.email,
    r.name as role
FROM
    whygym.users u
    INNER JOIN whygym.user_roles ur ON u.id = ur.user_id
    INNER JOIN whygym.roles r ON ur.role_id = r.id;

-- name: GetUserByEmail :one
SELECT
    u.id,
    u.username,
    u.password,
    STRING_AGG(r.name, ', ')::text AS roles
FROM
    whygym.users u
    LEFT JOIN whygym.user_roles ur ON u.id = ur.user_id
    LEFT JOIN whygym.roles r ON ur.role_id = r.id
WHERE u.email = $1
GROUP BY u.id, u.username
LIMIT 1;

-- name: GetTodayVisits :many
SELECT id, member_id, email, pic_url, check_in_time
FROM whygym.visits 
WHERE check_in_date = CURRENT_DATE
ORDER BY check_in_time DESC;

-- name: CreateVisit :one
INSERT INTO whygym.visits (member_id, email, pic_url)
VALUES ($1, $2, $3)
RETURNING id, member_id, email, pic_url, check_in_time;

-- name: GetMemberIdByEmail :one
SELECT id FROM whygym.members
WHERE email = $1
LIMIT 1;

-- name: GetVisitsAfterId :many 
SELECT id, member_id, email, pic_url, check_in_time
FROM whygym.visits 
WHERE id > $1
ORDER BY check_in_time DESC;

-- name: GetLastVisitId :one
SELECT id FROM whygym.visits
ORDER BY id DESC
LIMIT 1;

-- name: CreateUserRequest :one
INSERT INTO whygym.create_user_requests (username, password, email)
VALUES ($1, $2, $3)
RETURNING id, username, password, email, status, created_at, updated_at;

-- name: ApproveUserRequest :one
UPDATE whygym.create_user_requests
SET status = 'approved', approved_by = $1
WHERE id = $2
RETURNING id, username, password, email, status, created_at, updated_at;

-- name: RejectUserRequest :one
UPDATE whygym.create_user_requests
SET status = 'rejected', approved_by = $1
WHERE id = $2
RETURNING id, username, password, email, status, created_at, updated_at;

-- name: GetPendingUserRequests :many
SELECT id, username, password, email, status, created_at, updated_at
FROM whygym.create_user_requests
WHERE status = 'pending';

-- name: GetUserRequests :many
SELECT id, username, password, email, status, created_at, updated_at, approved_by
FROM whygym.create_user_requests
ORDER BY created_at DESC;

-- name: ApproveAndApplyUser :one
WITH approve_create_user AS
    (
        UPDATE whygym.create_user_requests cur
        SET status = 'approved', approved_by = $1
        WHERE cur.id = $2
        RETURNING cur.username, cur.password, cur.email, cur.status, cur.created_at, cur.updated_at, gen_salt('md5') as salt
    )
INSERT INTO whygym.users (username, password, email)
SELECT username, crypt(password, salt), email
FROM approve_create_user
RETURNING username, password;

-- name: CheckUserCredentials :one
SELECT count(*) FROM whygym.users 
WHERE username = $1 AND password = crypt($2, password) LIMIT 1;


-- name: GetUserByUsername :one
SELECT
    u.id,
    u.username,
    u.password,
    STRING_AGG(r.name, ', ')::text AS roles
FROM
    whygym.users u
    LEFT JOIN whygym.user_roles ur ON u.id = ur.user_id
    LEFT JOIN whygym.roles r ON ur.role_id = r.id
WHERE u.username = $1
GROUP BY u.id, u.username
LIMIT 1;

-- name: CreateAndGetUser :one
WITH inserted_user AS (
INSERT INTO whygym.users (email, username, password) VALUES ($1, $2, md5($3))
    ON CONFLICT DO NOTHING
RETURNING id, username, password, email)
SELECT
    inserted_user.id,
    inserted_user.username,
    inserted_user.password,
    STRING_AGG(r.name, ', ')::text AS roles
FROM
    whygym.user_roles ur
    RIGHT JOIN inserted_user ON inserted_user.id = ur.user_id
    LEFT JOIN whygym.roles r ON ur.role_id = r.id
GROUP BY inserted_user.id, inserted_user.username, inserted_user.password
LIMIT 1;

-- name: AddOrUpdateUserPicture :one
INSERT INTO whygym.users_attributes (user_id, key, value)
VALUES ($1, 'picture', $2)
ON CONFLICT (user_id, key) DO UPDATE
SET value = $2, updated_at = NOW()
RETURNING id, user_id, key, value;


-- name: GetUserPicture :one
SELECT value FROM whygym.users_attributes
WHERE user_id = $1 AND key = 'picture'
LIMIT 1;

-- name: CreateMemberByEmail :one
INSERT INTO whygym.members (email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data, created_at, updated_at;


-- name: CreateMemberByUsername :one
INSERT INTO whygym.members (email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data)
VALUES ($1, $2, $3, $4, $5, 'username in email field', $6)
RETURNING id, email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data, created_at, updated_at;

-- name: GetPendingMembershipByEmail :one
SELECT id, email, nickname, date_of_birth, phone_number, membership_status, created_at, notes, additional_data FROM whygym.members
WHERE membership_status = 'PENDING' AND (email = $1 OR additional_data->>'emailPic' = $1) LIMIT 1;

-- name: DeletePendingMembership :one
DELETE FROM whygym.members
WHERE id = $1 AND membership_status = 'PENDING' AND (email = $2 OR additional_data->>'emailPic' = $2) RETURNING id;
