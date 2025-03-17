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
SELECT id, member_id, email, pic_url, check_in_time, visit_code
FROM whygym.visits 
WHERE check_in_date = CURRENT_DATE
ORDER BY check_in_time DESC`;

export interface GetTodayVisitsRow {
    id: string;
    memberId: number;
    email: string | null;
    picUrl: string;
    checkInTime: Date;
    visitCode: number;
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
            checkInTime: row[4],
            visitCode: row[5]
        };
    });
}

export const createVisitQuery = `-- name: CreateVisit :one
INSERT INTO whygym.visits (member_id, email, pic_url)
VALUES ($1, $2, $3)
RETURNING id, member_id, email, pic_url, check_in_time, visit_code`;

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
    visitCode: number;
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
        checkInTime: row[4],
        visitCode: row[5]
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
SELECT id, member_id, email, pic_url, check_in_time, visit_code
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
    visitCode: number;
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
            checkInTime: row[4],
            visitCode: row[5]
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

export const rejectUserRequestQuery = `-- name: RejectUserRequest :one
UPDATE whygym.create_user_requests
SET status = 'rejected', approved_by = $1
WHERE id = $2
RETURNING id, username, password, email, status, created_at, updated_at`;

export interface RejectUserRequestArgs {
    approvedBy: number | null;
    id: number;
}

export interface RejectUserRequestRow {
    id: number;
    username: string;
    password: string;
    email: string | null;
    status: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function rejectUserRequest(client: Client, args: RejectUserRequestArgs): Promise<RejectUserRequestRow | null> {
    const result = await client.query({
        text: rejectUserRequestQuery,
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

export const approveAndApplyUserQuery = `-- name: ApproveAndApplyUser :one
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
RETURNING username, password`;

export interface ApproveAndApplyUserArgs {
    approvedBy: number | null;
    id: number;
}

export interface ApproveAndApplyUserRow {
    username: string;
    password: string;
}

export async function approveAndApplyUser(client: Client, args: ApproveAndApplyUserArgs): Promise<ApproveAndApplyUserRow | null> {
    const result = await client.query({
        text: approveAndApplyUserQuery,
        values: [args.approvedBy, args.id],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        username: row[0],
        password: row[1]
    };
}

export const checkUserCredentialsQuery = `-- name: CheckUserCredentials :one
SELECT count(*) FROM whygym.users 
WHERE username = $1 AND password = crypt($2, password) LIMIT 1`;

export interface CheckUserCredentialsArgs {
    username: string;
    crypt: string;
}

export interface CheckUserCredentialsRow {
    count: string;
}

export async function checkUserCredentials(client: Client, args: CheckUserCredentialsArgs): Promise<CheckUserCredentialsRow | null> {
    const result = await client.query({
        text: checkUserCredentialsQuery,
        values: [args.username, args.crypt],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        count: row[0]
    };
}

export const getUserByUsernameQuery = `-- name: GetUserByUsername :one
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
LIMIT 1`;

export interface GetUserByUsernameArgs {
    username: string;
}

export interface GetUserByUsernameRow {
    id: number;
    username: string;
    password: string;
    roles: string;
}

export async function getUserByUsername(client: Client, args: GetUserByUsernameArgs): Promise<GetUserByUsernameRow | null> {
    const result = await client.query({
        text: getUserByUsernameQuery,
        values: [args.username],
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

export const createAndGetUserQuery = `-- name: CreateAndGetUser :one
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
LIMIT 1`;

export interface CreateAndGetUserArgs {
    email: string | null;
    username: string;
    md5: Buffer;
}

export interface CreateAndGetUserRow {
    id: number;
    username: string;
    password: string;
    roles: string;
}

export async function createAndGetUser(client: Client, args: CreateAndGetUserArgs): Promise<CreateAndGetUserRow | null> {
    const result = await client.query({
        text: createAndGetUserQuery,
        values: [args.email, args.username, args.md5],
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

export const addOrUpdateUserPictureQuery = `-- name: AddOrUpdateUserPicture :one
INSERT INTO whygym.users_attributes (user_id, key, value)
VALUES ($1, 'picture', $2)
ON CONFLICT (user_id, key) DO UPDATE
SET value = $2, updated_at = NOW()
RETURNING id, user_id, key, value`;

export interface AddOrUpdateUserPictureArgs {
    userId: string;
    value: string;
}

export interface AddOrUpdateUserPictureRow {
    id: string;
    userId: string;
    key: string;
    value: string;
}

export async function addOrUpdateUserPicture(client: Client, args: AddOrUpdateUserPictureArgs): Promise<AddOrUpdateUserPictureRow | null> {
    const result = await client.query({
        text: addOrUpdateUserPictureQuery,
        values: [args.userId, args.value],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        userId: row[1],
        key: row[2],
        value: row[3]
    };
}

export const getUserPictureQuery = `-- name: GetUserPicture :one
SELECT value FROM whygym.users_attributes
WHERE user_id = $1 AND key = 'picture'
LIMIT 1`;

export interface GetUserPictureArgs {
    userId: string;
}

export interface GetUserPictureRow {
    value: string;
}

export async function getUserPicture(client: Client, args: GetUserPictureArgs): Promise<GetUserPictureRow | null> {
    const result = await client.query({
        text: getUserPictureQuery,
        values: [args.userId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        value: row[0]
    };
}

export const createMemberByEmailQuery = `-- name: CreateMemberByEmail :one
INSERT INTO whygym.members (email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data, created_at, updated_at`;

export interface CreateMemberByEmailArgs {
    email: string | null;
    nickname: string;
    dateOfBirth: Date | null;
    phoneNumber: string | null;
    membershipStatus: string;
    notes: string | null;
    additionalData: any | null;
}

export interface CreateMemberByEmailRow {
    id: number;
    email: string | null;
    nickname: string;
    dateOfBirth: Date | null;
    phoneNumber: string | null;
    membershipStatus: string;
    notes: string | null;
    additionalData: any | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function createMemberByEmail(client: Client, args: CreateMemberByEmailArgs): Promise<CreateMemberByEmailRow | null> {
    const result = await client.query({
        text: createMemberByEmailQuery,
        values: [args.email, args.nickname, args.dateOfBirth, args.phoneNumber, args.membershipStatus, args.notes, args.additionalData],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        email: row[1],
        nickname: row[2],
        dateOfBirth: row[3],
        phoneNumber: row[4],
        membershipStatus: row[5],
        notes: row[6],
        additionalData: row[7],
        createdAt: row[8],
        updatedAt: row[9]
    };
}

export const createMemberByUsernameQuery = `-- name: CreateMemberByUsername :one
INSERT INTO whygym.members (email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data)
VALUES ($1, $2, $3, $4, $5, 'username in email field', $6)
RETURNING id, email, nickname, date_of_birth, phone_number, membership_status, notes, additional_data, created_at, updated_at`;

export interface CreateMemberByUsernameArgs {
    email: string | null;
    nickname: string;
    dateOfBirth: Date | null;
    phoneNumber: string | null;
    membershipStatus: string;
    additionalData: any | null;
}

export interface CreateMemberByUsernameRow {
    id: number;
    email: string | null;
    nickname: string;
    dateOfBirth: Date | null;
    phoneNumber: string | null;
    membershipStatus: string;
    notes: string | null;
    additionalData: any | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function createMemberByUsername(client: Client, args: CreateMemberByUsernameArgs): Promise<CreateMemberByUsernameRow | null> {
    const result = await client.query({
        text: createMemberByUsernameQuery,
        values: [args.email, args.nickname, args.dateOfBirth, args.phoneNumber, args.membershipStatus, args.additionalData],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        email: row[1],
        nickname: row[2],
        dateOfBirth: row[3],
        phoneNumber: row[4],
        membershipStatus: row[5],
        notes: row[6],
        additionalData: row[7],
        createdAt: row[8],
        updatedAt: row[9]
    };
}

export const getPendingMembershipByEmailQuery = `-- name: GetPendingMembershipByEmail :one
SELECT id, email, nickname, date_of_birth, phone_number, membership_status, created_at, notes, additional_data FROM whygym.members
WHERE membership_status = 'PENDING' AND (email = $1 OR additional_data->>'emailPic' = $1) LIMIT 1`;

export interface GetPendingMembershipByEmailArgs {
    email: string | null;
}

export interface GetPendingMembershipByEmailRow {
    id: number;
    email: string | null;
    nickname: string;
    dateOfBirth: Date | null;
    phoneNumber: string | null;
    membershipStatus: string;
    createdAt: Date | null;
    notes: string | null;
    additionalData: any | null;
}

export async function getPendingMembershipByEmail(client: Client, args: GetPendingMembershipByEmailArgs): Promise<GetPendingMembershipByEmailRow | null> {
    const result = await client.query({
        text: getPendingMembershipByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        email: row[1],
        nickname: row[2],
        dateOfBirth: row[3],
        phoneNumber: row[4],
        membershipStatus: row[5],
        createdAt: row[6],
        notes: row[7],
        additionalData: row[8]
    };
}

export const deletePendingMembershipQuery = `-- name: DeletePendingMembership :one
DELETE FROM whygym.members
WHERE id = $1 AND membership_status = 'PENDING' AND (email = $2 OR additional_data->>'emailPic' = $2) RETURNING id`;

export interface DeletePendingMembershipArgs {
    id: number;
    email: string | null;
}

export interface DeletePendingMembershipRow {
    id: number;
}

export async function deletePendingMembership(client: Client, args: DeletePendingMembershipArgs): Promise<DeletePendingMembershipRow | null> {
    const result = await client.query({
        text: deletePendingMembershipQuery,
        values: [args.id, args.email],
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

export const getWeeklyVisitsByEmailQuery = `-- name: GetWeeklyVisitsByEmail :many
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
SELECT 'week ' || ws.week_of_year, coalesce(count, 0)
FROM week_series ws
    LEFT JOIN data d ON ws.week_of_year = d.week_of_year
    ORDER BY ws.week_of_year ASC`;

export interface GetWeeklyVisitsByEmailArgs {
    email: string | null;
}

export interface GetWeeklyVisitsByEmailRow {
    : string | null;
    count: string;
}

export async function getWeeklyVisitsByEmail(client: Client, args: GetWeeklyVisitsByEmailArgs): Promise<GetWeeklyVisitsByEmailRow[]> {
    const result = await client.query({
        text: getWeeklyVisitsByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            : row[0],
            count: row[1]
        };
    });
}

export const getMonthlyVisitsByEmailQuery = `-- name: GetMonthlyVisitsByEmail :many
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
SELECT 'month ' || ms.month_of_year, coalesce(count, 0)
FROM month_series ms
    LEFT JOIN data d ON ms.month_of_year = d.month_of_year
    WHERE ms.month_of_year > 0
    ORDER BY ms.month_of_year ASC`;

export interface GetMonthlyVisitsByEmailArgs {
    email: string | null;
}

export interface GetMonthlyVisitsByEmailRow {
    : string | null;
    count: string;
}

export async function getMonthlyVisitsByEmail(client: Client, args: GetMonthlyVisitsByEmailArgs): Promise<GetMonthlyVisitsByEmailRow[]> {
    const result = await client.query({
        text: getMonthlyVisitsByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            : row[0],
            count: row[1]
        };
    });
}

