import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getAllUsersRolesQuery = `-- name: GetAllUsersRoles :many
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

SELECT
    u.id,
    u.username,
    u.password,
    u.email,
    r.name as role
FROM
    whygym.users u
    INNER JOIN whygym.user_roles ur ON u.id = ur.user_id
    INNER JOIN whygym.roles r ON ur.role_id = r.id`;

export interface GetAllUsersRolesRow {
    id: number;
    username: string;
    password: string;
    email: string;
    role: string;
}

export async function getAllUsersRoles(client: Client): Promise<GetAllUsersRolesRow[]> {
    const result = await client.query({
        text: getAllUsersRolesQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            username: row[1],
            password: row[2],
            email: row[3],
            role: row[4]
        };
    });
}

export const getUserByEmailQuery = `-- name: GetUserByEmail :one
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
LIMIT 1`;

export interface GetUserByEmailArgs {
    email: string;
}

export interface GetUserByEmailRow {
    id: number;
    username: string;
    password: string;
    roles: string;
}

export async function getUserByEmail(client: Client, args: GetUserByEmailArgs): Promise<GetUserByEmailRow | null> {
    const result = await client.query({
        text: getUserByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        username: row[1],
        password: row[2],
        roles: row[3]
    };
}

