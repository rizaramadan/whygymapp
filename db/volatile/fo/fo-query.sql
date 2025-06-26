-- name: addFoExtensionOrder :one
update whygym.extension_orders 
set updated_at = now(),
    additional_data = jsonb_set(additional_data::jsonb, '{frontOfficer}'::text[], $2::jsonb)
where id = $1
returning id, reference_id;