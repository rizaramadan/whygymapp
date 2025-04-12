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
SELECT id, member_id, email, pic_url, check_in_time, visit_code
FROM whygym.visits 
WHERE check_in_date = CURRENT_DATE
ORDER BY check_in_time DESC;

-- name: CreateVisit :one
INSERT INTO whygym.visits (member_id, email, pic_url)
VALUES ($1, $2, $3)
RETURNING id, member_id, email, pic_url, check_in_time, visit_code;

-- name: GetMemberIdByEmail :one
SELECT id, email, membership_status, nickname, date_of_birth, phone_number, additional_data FROM whygym.members
WHERE email = $1
LIMIT 1;

-- name: GetMemberById :one
SELECT id, email, membership_status, nickname, date_of_birth, phone_number, additional_data FROM whygym.members
WHERE id = $1
LIMIT 1;

-- name: UpdateMemberAdditionalData :one
UPDATE whygym.members SET updated_at = current_timestamp, additional_data = jsonb_set(
     jsonb_set(
             jsonb_set(
                     additional_data::jsonb,
                     '{duration}'::text[], $4::jsonb)
         , '{gender}'::text[], $5::jsonb
     ),
     '{emailPic}'::text[], $3::jsonb)
WHERE id = $1 AND membership_status = 'pending' AND email = $2 returning id, email;

-- name: GetVisitsAfterId :many 
SELECT id, member_id, email, pic_url, check_in_time, visit_code
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
SET status = 'approved', approved_by = $1, updated_at = current_timestamp
WHERE id = $2
RETURNING id, username, password, email, status, created_at, updated_at;

-- name: RejectUserRequest :one
UPDATE whygym.create_user_requests
SET status = 'rejected', approved_by = $1, updated_at = current_timestamp
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
        SET status = 'approved', approved_by = $1, updated_at = current_timestamp
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
WHERE membership_status = 'pending' AND (email = $1 OR additional_data->>'emailPic' = $1) LIMIT 1;

-- name: GetActiveMembershipByEmail :one
SELECT id, email, nickname, date_of_birth, phone_number, membership_status, created_at, notes, additional_data FROM whygym.members
WHERE membership_status = 'active' AND email = $1  LIMIT 1;

-- name: DeletePendingMembership :one
DELETE FROM whygym.members
WHERE id = $1 AND membership_status = 'pending' AND (email = $2 OR additional_data->>'emailPic' = $2) RETURNING id;


-- name: GetWeeklyVisitsByEmail :many
WITH data AS (SELECT
    EXTRACT(WEEK FROM check_in_date) AS week_of_year, count(*) AS count
FROM whygym.visits
WHERE email = $1
GROUP BY EXTRACT(WEEK FROM check_in_date)
ORDER BY EXTRACT(WEEK FROM check_in_date) DESC
LIMIT 5),
week_series AS(
    SELECT generate_series (
        EXTRACT(WEEK FROM CURRENT_DATE)::INT - 4,
        EXTRACT(WEEK FROM CURRENT_DATE)::INT
    ) as week_of_year
)
SELECT 'week ' || ws.week_of_year AS week_number, coalesce(count, 0) AS week_count
FROM week_series ws
    LEFT JOIN data d ON ws.week_of_year = d.week_of_year
    ORDER BY ws.week_of_year ASC;


-- name: GetMonthlyVisitsByEmail :many
WITH data AS (
    SELECT EXTRACT(month FROM check_in_date) AS month_of_year, count(*) AS count
    FROM whygym.visits
    WHERE email =  $1
    GROUP BY EXTRACT(month FROM check_in_date)
    ORDER BY EXTRACT(month FROM check_in_date) DESC
    LIMIT 5),
month_series AS (
    SELECT generate_series (
        EXTRACT(month FROM CURRENT_DATE)::INT - 4,
        EXTRACT(month FROM CURRENT_DATE)::INT
    ) as month_of_year
)
SELECT 'month ' || ms.month_of_year AS month_number, coalesce(count, 0) AS month_count
FROM month_series ms
    LEFT JOIN data d ON ms.month_of_year = d.month_of_year
    WHERE ms.month_of_year > 0
    ORDER BY ms.month_of_year ASC;


-- name: CreateMemberOrder :one
WITH im AS (
    INSERT INTO whygym.members (email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data)
    VALUES ($1, $2, $3, $4, 'pending', $5, $6)
    RETURNING id, email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data, created_at, updated_at
),
inserted_orders AS (
    INSERT INTO whygym.orders (member_id, price, order_status)
    SELECT im.id, $7, 'waiting payment method' FROM im LIMIT 1
    RETURNING id, reference_id, member_id, price
)
INSERT INTO whygym.order_groups (main_reference_id, part_id, part_reference_id, notes)
SELECT reference_id, member_id, reference_id, cast(price as varchar) 
FROM inserted_orders
returning id, main_reference_id, part_id, notes::numeric;


-- name: CreatePrivateCoachingOrder :one
WITH im AS (
    INSERT INTO whygym.private_coaching (email, member_id, coach_type, number_of_sessions, status, additional_data)
    VALUES ($1, $2, $3,$4,'pending', $5)
    RETURNING id, email, member_id, status, notes, additional_data, created_at, updated_at
),
inserted_orders AS (
    INSERT INTO whygym.orders (member_id, price, order_status, private_coaching_id)
    SELECT im.member_id, $6, 'waiting payment method', im.id FROM im LIMIT 1
    RETURNING id, reference_id, member_id, price
)
INSERT INTO whygym.order_groups (main_reference_id, part_id, part_reference_id, notes)
SELECT reference_id, member_id, reference_id, cast(price as varchar)
FROM inserted_orders
returning id, main_reference_id, part_id, notes::numeric;


-- name: CreateDuoPrivateCoachingOrder :many
WITH im AS (
    INSERT INTO whygym.private_coaching (email, member_id, coach_type, number_of_sessions, status, additional_data)
    VALUES ($1, $2, $3,  $4,'pending', $5),
           ($6, $7, $3,  $4,'pending', $5)
    RETURNING id, email, member_id, status, notes, additional_data, created_at, updated_at
),
inserted_orders AS (
    INSERT INTO whygym.orders (member_id, price, order_status, private_coaching_id)
    SELECT im.member_id, $8, 'waiting payment method', im.id FROM im LIMIT 2
    RETURNING id, reference_id, member_id, price
),
pic_data AS (
    SELECT id, reference_id, member_id, price from inserted_orders where member_id = $2 limit 1
)
INSERT INTO whygym.order_groups (main_reference_id, part_id, part_reference_id, notes)
SELECT (select reference_id from pic_data), member_id, reference_id, cast(price as varchar)
FROM inserted_orders
returning id, main_reference_id, part_id, notes::numeric;


-- name: linkGroupOrder :one
with email_pic AS (
select m.additional_data ->> 'emailPic' as email_pic, m.email, m.id as ori_id
                  from whygym.members m
                  where m.id = $1
                  and additional_data->>'emailPic' != email
                  limit 1
),
   main_member AS (
        select m.id, o.reference_id, email_pic, email_pic.ori_id from whygym.members m
                        inner join email_pic on m.email = email_pic.email_pic
                        inner join whygym.orders o on m.id = o.member_id

                    and m.additional_data->> 'emailPic' = m.email
                  limit 1
) update whygym.order_groups og set updated_at = current_timestamp,
                                 main_reference_id = main_member.reference_id
from main_member where main_member.ori_id = og.part_id
returning og.part_id, og.main_reference_id;

-- name: GetOrderReferenceIdByEmail :one
SELECT reference_id, m.additional_data, m.nickname, o.created_at, m.id as memberId
FROM whygym.orders o
    INNER JOIN whygym.members m ON o.member_id = m.id
WHERE m.membership_status = 'pending'
    AND m.email = $1
LIMIT 1;


-- name: GetPrivateCoachingOrderReferenceIdByEmail :one
SELECT reference_id, pc.additional_data, o.created_at, pc.member_id
FROM whygym.orders o
    INNER JOIN whygym.private_coaching pc ON o.private_coaching_id = pc.id
WHERE pc.status = 'pending'
    AND pc.email = $1
LIMIT 1;


-- name: getOrderByReferenceId :one
SELECT id, member_id, price, reference_id, order_status, url, created_at, 
       updated_at, notes, additional_info, private_coaching_id
FROM whygym.orders
WHERE reference_id = $1
LIMIT 1;

-- name: getWaitingPaymentOrders :many  
WITH data AS (
    select distinct og.main_reference_id
    from whygym.order_groups og
        inner join whygym.orders o on og.main_reference_id = o.reference_id
    where o.price > 1 AND (o.order_status = 'waiting payment method' OR o.order_status = 'waiting invoice status' OR (o.order_status = 'complete' AND o.updated_at::date = current_date))

)
SELECT o.id, o.price, o.reference_id, o.member_id, o.order_status, o.additional_info, m.email, m.nickname, m.additional_data
    from data og
    inner join whygym.orders o on og.main_reference_id = o.reference_id
    inner join whygym.members m on o.member_id = m.id
    order by o.created_at desc;



-- name: turnOnCashback100 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback100": true, "cashback200": false, "cashback50": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOffCashback100 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback100": false}'::jsonb, 
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOnCashback200 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback100": false, "cashback200": true, "cashback50": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOffCashback200 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback200": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOnCashback50 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback100": false, "cashback200": false, "cashback50": true}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOffCashback50 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback50": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOnExtend30 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend15": false, "extend30": true, "extend60": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOffExtend30 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend30": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOnExtend60 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend15": false, "extend30": false, "extend60": true}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOffExtend60 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend60": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOnExtend15 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend15": true, "extend30": false, "extend60": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: turnOffExtend15 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend15": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id;

-- name: insertOrderStatusLog :one
INSERT INTO whygym.orders_status_log (reference_id, order_status, notes, additional_info)
VALUES ($1, $2, $3, $4)
RETURNING id, reference_id, order_status, notes, additional_info;

-- name: getOrderAndMemberByReferenceId :one
SELECT o.id, o.member_id, o.price, o.reference_id, o.order_status, o.url, o.created_at, o.updated_at, o.notes, 
       o.additional_info, m.email, m.nickname, m.additional_data, m.phone_number
FROM whygym.orders o
    INNER JOIN whygym.members m ON o.member_id = m.id   
WHERE o.reference_id = $1
LIMIT 1;

-- name: getOrderAndPrivateCoachingByReferenceId :one
SELECT o.id, o.member_id, o.price, o.reference_id, o.order_status, o.url, o.created_at, o.updated_at, o.notes,
       o.additional_info, pc.email, pc.additional_data
FROM whygym.orders o
    INNER JOIN whygym.private_coaching pc ON o.private_coaching_id = pc.id
WHERE o.reference_id = $1
LIMIT 1;

-- name: setOrderInvoiceResponse :one
WITH data AS (
    SELECT $1::text AS content, $2::text as ref_id
)
UPDATE whygym.orders
SET updated_at = current_timestamp,
    additional_info = 
        jsonb_set(
            coalesce(additional_info, '{}'),
            '{invoice_response}', 
            data.content::jsonb
        ), 
    order_status = 'waiting invoice status' 
FROM data
WHERE reference_id = data.ref_id
RETURNING id, additional_info, reference_id;

-- name: setOrderInvoiceRequestResponse :one
WITH data AS (
    SELECT $1::text AS content, $2::text as ref_id, $3::text AS request
)
UPDATE whygym.orders
SET updated_at = current_timestamp,
    additional_info = 
        jsonb_set(
            jsonb_set(
                coalesce(additional_info, '{}'), 
                '{invoice_request}', 
                data.request::jsonb
            ), 
            '{invoice_response}', 
            data.content::jsonb
        ), 
    order_status = 'waiting invoice status' 
FROM data
WHERE reference_id = data.ref_id
RETURNING id, additional_info, reference_id;


-- name: getUserRoles :many
SELECT name as roles FROM whygym.user_roles ur
    INNER JOIN whygym.roles r ON r.id =  ur.role_id
    WHERE ur.user_id = $1;

-- name: setInvoiceStatusResponseAndActivateMembership :one
WITH the_row AS (
    SELECT id FROM whygym.orders_status_log osl WHERE osl.reference_id = $1
    ORDER BY created_at DESC LIMIT 1),
save_invoice_status AS (UPDATE whygym.orders_status_log l SET additional_info = jsonb_set(coalesce(additional_info, '{}'),'{invoiceStatusResponse}', $2::jsonb)
                                FROM the_row t
                                WHERE l.id = t.id
RETURNING l.reference_id, l.id, additional_info),
the_payer_id AS (
    UPDATE whygym.orders o SET updated_at = current_timestamp, order_status = 'complete'
    FROM save_invoice_status sis WHERE o.reference_id = sis.reference_id
    RETURNING o.id, o.member_id
),
the_follower AS (
    UPDATE whygym.orders o SET updated_at = current_timestamp, order_status = 'completed by ' || the_payer_id.id
    FROM the_payer_id
    WHERE o.member_id != the_payer_id.member_id
              AND o.member_id IN
                  (SELECT part_id FROM whygym.order_groups og WHERE og.main_reference_id = $1)
    RETURNING o.member_id
)
UPDATE whygym.members m SET updated_at = current_timestamp, membership_status = 'active'
    WHERE m.id IN (SELECT part_id FROM whygym.order_groups og WHERE og.main_reference_id = $1)
    RETURNING m.id;

-- name: getPaymentUrlByReferenceId :one
SELECT additional_info->'invoice_response'->'data'->'paymentUrl' AS paymentUrl
FROM whygym.orders WHERE reference_id = $1
    AND additional_info->'invoice_response'->'data'->'paymentUrl' IS NOT NULL
LIMIT 1;

-- name: getPotentialGroupData :many
WITH email_pic AS (
SELECT reference_id, m.additional_data, m.nickname, o.created_at, m.id AS memberId,
       m.additional_data ->> 'emailPic'::text as email_pic,
       m.additional_data ->> 'duration'::text as duration
FROM whygym.orders o
    INNER JOIN whygym.members m ON o.member_id = m.id
WHERE m.membership_status = 'pending'
    AND m.email = $1
    AND m.additional_data ->> 'emailPic'::text = $1
LIMIT 1)
SELECT m.id, m.email, m.nickname, m.additional_data->> 'gender' AS gender, m.additional_data->> 'duration' AS duration, 
    CASE WHEN og.main_reference_id = email_pic.reference_id THEN true ELSE false END AS checked
FROM whygym.members m 
    INNER JOIN email_pic ON m.additional_data ->> 'emailPic'::text = email_pic.email_pic
        AND m.additional_data ->> 'duration'::text = email_pic.duration
    INNER JOIN whygym.order_groups og ON og.part_id = m.id
WHERE m.membership_status = 'pending' ORDER BY m.nickname LIMIT 10;

-- name: getPotentialPrivateCoachingGroupData :many    
WITH email_pic AS (
SELECT reference_id, m.additional_data, o.created_at, m.id AS memberId,
       m.additional_data ->> 'emailPic'::text as email_pic,
       m.additional_data ->> 'duration'::text as duration
FROM whygym.orders o
    INNER JOIN whygym.private_coaching m ON o.member_id = m.id
WHERE m.status = 'pending'
    AND m.email = $1
    AND m.additional_data ->> 'emailPic'::text = $1
LIMIT 1)
SELECT m.id, m.email, m.additional_data->> 'gender' AS gender, m.coach_type,
    CASE WHEN og.main_reference_id = email_pic.reference_id THEN true ELSE false END AS checked
FROM whygym.private_coaching m
    INNER JOIN email_pic ON m.additional_data ->> 'emailPic'::text = email_pic.email_pic
        AND m.additional_data ->> 'duration'::text = email_pic.duration
    INNER JOIN whygym.order_groups og ON og.part_id = m.id
WHERE m.status = 'pending' ORDER BY m.email LIMIT 10;



-- name: joinToGroup :one
UPDATE whygym.order_groups SET updated_at = current_timestamp,
                               main_reference_id = $1
WHERE part_id = $2
RETURNING id, main_reference_id, part_id, part_reference_id;

-- name: removeFromGroup :one
UPDATE whygym.order_groups SET updated_at = current_timestamp,
                               main_reference_id = part_reference_id
WHERE part_id = $1
RETURNING id, main_reference_id, part_id, part_reference_id;

-- name: getActiveMemberBreakdown :many
with groups as (
  select main_reference_id, count(*) as count from whygym.order_groups group by main_reference_id having count(*) > 1
),
group_counts AS (
  select og.part_reference_id, coalesce(g.count, 1) as count from whygym.order_groups og left join groups g on og.main_reference_id = g.main_reference_id
)
select m.email,
       m.additional_data->> 'gender' as gender,
       coalesce(m.additional_data->> 'promoType', 'new_member') as promo_type,
       CASE
           WHEN g.count is null THEN coalesce(m.additional_data->> 'groupType', 'single')
           WHEN g.count::int = 2 THEN 'duo'
           WHEN g.count::int > 3 THEN 'group'
           ELSE 'single'
       END as  group_type,
       m.additional_data->> 'duration' as duration,
       g.count,
       m.start_date
from whygym.members m
    left join whygym.orders o on m.id = o.member_id
    left join group_counts g on o.reference_id = g.part_reference_id
where m.membership_status = 'active' order by m.id desc;

-- name: getMemberActiveDate :one
WITH data as (
select
    case when created_at < '2025-04-01 00:00:00' THEN '2025-04-01' else created_at::date end as start_date,
    additional_data->>'duration' || ' days' as duration
from whygym.members where email = $1 and membership_status = 'active' limit 1)
select data.start_date, data.duration,  (data.start_date + data.duration::interval)::date as end_date
from data limit 1;

-- name: addOrUpdateMemberPicUrl :one
update whygym.members 
set updated_at = now(),
    additional_data = jsonb_set(additional_data::jsonb, '{picUrl}'::text[], $2::jsonb)
where email = $1
returning id, email;
