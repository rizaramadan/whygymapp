CREATE TABLE IF NOT EXISTS whygym.order_groups (
    id SERIAL PRIMARY KEY,
    main_reference_id VARCHAR(40) NOT NULL,
    part_id integer NOT NULL,
    part_reference_id VARCHAR(40) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    additional_info JSONB
);

create index if not exists idx_order_groups_main_reference_id on whygym.order_groups (main_reference_id);
create index if not exists idx_order_groups_part_reference_id on whygym.order_groups (part_reference_id); 

create index if not exists idx_members_email_pic on whygym.members ((additional_data ->> 'emailPic'::text));



