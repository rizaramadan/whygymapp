

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

-- name: setInvoiceStatusResponseAndActivatePrivateCoaching :one
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
    RETURNING o.id, o.member_id, o.private_coaching_id
),
the_follower AS (
    UPDATE whygym.orders o SET updated_at = current_timestamp, order_status = 'completed by ' || the_payer_id.id
    FROM the_payer_id
    WHERE o.member_id != the_payer_id.member_id
              AND o.member_id IN
                  (SELECT part_id FROM whygym.order_groups og WHERE og.main_reference_id = $1)
              AND o.reference_id IN
                  (SELECT part_reference_id from whygym.order_groups og WHERE og.main_reference_id = $1)
    RETURNING o.id, o.member_id, o.private_coaching_id
),
both_id AS (
    select p.private_coaching_id from the_payer_id p union select f.private_coaching_id from the_follower f
)
UPDATE whygym.private_coaching m SET updated_at = current_timestamp, status = 'active'
    WHERE m.id IN (SELECT private_coaching_id FROM both_id)
    RETURNING m.id;

-- name: addOrUpdateMemberPicUrl :one
update whygym.members 
set updated_at = now(),
    additional_data = jsonb_set(additional_data::jsonb, '{picUrl}'::text[], $2::jsonb)
where email = $1
returning id, email;
