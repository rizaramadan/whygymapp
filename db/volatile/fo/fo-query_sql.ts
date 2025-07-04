import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const addFoExtensionOrderQuery = `-- name: addFoExtensionOrder :one
update whygym.extension_orders 
set updated_at = now(),
    additional_data = jsonb_set(additional_data::jsonb, '{frontOfficer}'::text[], $2::jsonb)
where id = $1
returning id, reference_id`;

export interface addFoExtensionOrderArgs {
    id: number;
    frontOfficer: any;
}

export interface addFoExtensionOrderRow {
    id: number;
    referenceId: string;
}

export async function addFoExtensionOrder(client: Client, args: addFoExtensionOrderArgs): Promise<addFoExtensionOrderRow | null> {
    const result = await client.query({
        text: addFoExtensionOrderQuery,
        values: [args.id, args.frontOfficer],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        referenceId: row[1]
    };
}
