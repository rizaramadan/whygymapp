-- name: UpdateMemberAdditionalData :one
UPDATE whygym.members SET updated_at = current_timestamp, additional_data = jsonb_set(
     jsonb_set(
             jsonb_set(
                     additional_data::jsonb,
                     '{duration}', $4::jsonb)
         , '{gender}', $5::jsonb
     ),
     '{emailPic}', $3::jsonb)
WHERE id = $1 AND membership_status = 'pending' AND email = $2 returning id, email;