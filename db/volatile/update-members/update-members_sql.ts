import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const updateMemberAdditionalDataQuery = `-- name: UpdateMemberAdditionalData :one
UPDATE whygym.members SET updated_at = current_timestamp, additional_data = jsonb_set(
     jsonb_set(
             jsonb_set(
                     additional_data::jsonb,
                     '{duration}', $4::jsonb)
         , '{gender}', $5::jsonb
     ),
     '{emailPic}', $3::jsonb)
WHERE id = $1 AND membership_status = 'pending' AND email = $2 returning id, email`;

export interface UpdateMemberAdditionalDataArgs {
    id: number;
    email: string | null;
    emailPic: string;
    duration: string;
    gender: string;
}

export interface UpdateMemberAdditionalDataRow {
    id: number;
    email: string | null;
}

export async function updateMemberAdditionalData(client: Client, args: UpdateMemberAdditionalDataArgs): Promise<UpdateMemberAdditionalDataRow | null> {
    const result = await client.query({
        text: updateMemberAdditionalDataQuery,
        values: [args.id, args.email, args.emailPic, args.duration, args.gender],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        email: row[1]
    };
}

