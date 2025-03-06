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
    email: string | null;
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
    email: string | null;
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

export const getTodayVisitsQuery = `-- name: GetTodayVisits :many
SELECT id, member_id, email, pic_url, check_in_time
FROM whygym.visits 
WHERE check_in_date = CURRENT_DATE
ORDER BY check_in_time DESC`;

export interface GetTodayVisitsRow {
    id: string;
    memberId: number;
    email: string | null;
    picUrl: string;
    checkInTime: Date;
}

export async function getTodayVisits(client: Client): Promise<GetTodayVisitsRow[]> {
    const result = await client.query({
        text: getTodayVisitsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            memberId: row[1],
            email: row[2],
            picUrl: row[3],
            checkInTime: row[4]
        };
    });
}

export const createVisitQuery = `-- name: CreateVisit :one
INSERT INTO whygym.visits (member_id, email, pic_url)
VALUES ($1, $2, $3)
RETURNING id, member_id, email, pic_url, check_in_time`;

export interface CreateVisitArgs {
    memberId: number;
    email: string | null;
    picUrl: string;
}

export interface CreateVisitRow {
    id: string;
    memberId: number;
    email: string | null;
    picUrl: string;
    checkInTime: Date;
}

export async function createVisit(client: Client, args: CreateVisitArgs): Promise<CreateVisitRow | null> {
    const result = await client.query({
        text: createVisitQuery,
        values: [args.memberId, args.email, args.picUrl],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        memberId: row[1],
        email: row[2],
        picUrl: row[3],
        checkInTime: row[4]
    };
}

export const getMemberIdByEmailQuery = `-- name: GetMemberIdByEmail :one
SELECT id FROM whygym.members
WHERE email = $1
LIMIT 1`;

export interface GetMemberIdByEmailArgs {
    email: string | null;
}

export interface GetMemberIdByEmailRow {
    id: number;
}

export async function getMemberIdByEmail(client: Client, args: GetMemberIdByEmailArgs): Promise<GetMemberIdByEmailRow | null> {
    const result = await client.query({
        text: getMemberIdByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0]
    };
}

export const getVisitsAfterIdQuery = `-- name: GetVisitsAfterId :many
SELECT id, member_id, email, pic_url, check_in_time
FROM whygym.visits 
WHERE id > $1
ORDER BY check_in_time DESC`;

export interface GetVisitsAfterIdArgs {
    id: string;
}

export interface GetVisitsAfterIdRow {
    id: string;
    memberId: number;
    email: string | null;
    picUrl: string;
    checkInTime: Date;
}

export async function getVisitsAfterId(client: Client, args: GetVisitsAfterIdArgs): Promise<GetVisitsAfterIdRow[]> {
    const result = await client.query({
        text: getVisitsAfterIdQuery,
        values: [args.id],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            memberId: row[1],
            email: row[2],
            picUrl: row[3],
            checkInTime: row[4]
        };
    });
}

export const getLastVisitIdQuery = `-- name: GetLastVisitId :one
SELECT id FROM whygym.visits
ORDER BY id DESC
LIMIT 1`;

export interface GetLastVisitIdRow {
    id: string;
}

export async function getLastVisitId(client: Client): Promise<GetLastVisitIdRow | null> {
    const result = await client.query({
        text: getLastVisitIdQuery,
        values: [],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0]
    };
}

export const createUserRequestQuery = `-- name: CreateUserRequest :one
INSERT INTO whygym.create_user_requests (username, password, email)
VALUES ($1, $2, $3)
RETURNING id, username, password, email, status, created_at, updated_at`;

export interface CreateUserRequestArgs {
    username: string;
    password: string;
    email: string | null;
}

export interface CreateUserRequestRow {
    id: number;
    username: string;
    password: string;
    email: string | null;
    status: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function createUserRequest(client: Client, args: CreateUserRequestArgs): Promise<CreateUserRequestRow | null> {
    const result = await client.query({
        text: createUserRequestQuery,
        values: [args.username, args.password, args.email],
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
        email: row[3],
        status: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

export const approveUserRequestQuery = `-- name: ApproveUserRequest :one
UPDATE whygym.create_user_requests
SET status = 'approved', approved_by = $1
WHERE id = $2
RETURNING id, username, password, email, status, created_at, updated_at`;

export interface ApproveUserRequestArgs {
    approvedBy: number | null;
    id: number;
}

export interface ApproveUserRequestRow {
    id: number;
    username: string;
    password: string;
    email: string | null;
    status: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function approveUserRequest(client: Client, args: ApproveUserRequestArgs): Promise<ApproveUserRequestRow | null> {
    const result = await client.query({
        text: approveUserRequestQuery,
        values: [args.approvedBy, args.id],
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
        email: row[3],
        status: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

export const getPendingUserRequestsQuery = `-- name: GetPendingUserRequests :many
SELECT id, username, password, email, status, created_at, updated_at
FROM whygym.create_user_requests
WHERE status = 'pending'`;

export interface GetPendingUserRequestsRow {
    id: number;
    username: string;
    password: string;
    email: string | null;
    status: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function getPendingUserRequests(client: Client): Promise<GetPendingUserRequestsRow[]> {
    const result = await client.query({
        text: getPendingUserRequestsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            username: row[1],
            password: row[2],
            email: row[3],
            status: row[4],
            createdAt: row[5],
            updatedAt: row[6]
        };
    });
}

export const getUserRequestsQuery = `-- name: GetUserRequests :many
SELECT id, username, password, email, status, created_at, updated_at, approved_by
FROM whygym.create_user_requests
ORDER BY created_at DESC`;

export interface GetUserRequestsRow {
    id: number;
    username: string;
    password: string;
    email: string | null;
    status: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    approvedBy: number | null;
}

export async function getUserRequests(client: Client): Promise<GetUserRequestsRow[]> {
    const result = await client.query({
        text: getUserRequestsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            username: row[1],
            password: row[2],
            email: row[3],
            status: row[4],
            createdAt: row[5],
            updatedAt: row[6],
            approvedBy: row[7]
        };
    });
}

