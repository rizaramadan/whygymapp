import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getAllUsersRolesQuery = `-- name: GetAllUsersRoles :many
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
SELECT id, email, membership_status, nickname, date_of_birth, phone_number, additional_data FROM whygym.members
WHERE email = $1
LIMIT 1`;

export interface GetMemberIdByEmailArgs {
    email: string | null;
}

export interface GetMemberIdByEmailRow {
    id: number;
    email: string | null;
    membershipStatus: string;
    nickname: string;
    dateOfBirth: Date | null;
    phoneNumber: string | null;
    additionalData: any | null;
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
        id: row[0],
        email: row[1],
        membershipStatus: row[2],
        nickname: row[3],
        dateOfBirth: row[4],
        phoneNumber: row[5],
        additionalData: row[6]
    };
}

export const getMemberByIdQuery = `-- name: GetMemberById :one
SELECT id, email, membership_status, nickname, date_of_birth, phone_number, additional_data FROM whygym.members
WHERE id = $1
LIMIT 1`;

export interface GetMemberByIdArgs {
    id: number;
}

export interface GetMemberByIdRow {
    id: number;
    email: string | null;
    membershipStatus: string;
    nickname: string;
    dateOfBirth: Date | null;
    phoneNumber: string | null;
    additionalData: any | null;
}

export async function getMemberById(client: Client, args: GetMemberByIdArgs): Promise<GetMemberByIdRow | null> {
    const result = await client.query({
        text: getMemberByIdQuery,
        values: [args.id],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        email: row[1],
        membershipStatus: row[2],
        nickname: row[3],
        dateOfBirth: row[4],
        phoneNumber: row[5],
        additionalData: row[6]
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
SET status = 'approved', approved_by = $1, updated_at = current_timestamp
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
SET status = 'rejected', approved_by = $1, updated_at = current_timestamp
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
        SET status = 'approved', approved_by = $1, updated_at = current_timestamp
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
WHERE membership_status = 'pending' AND (email = $1 OR additional_data->>'emailPic' = $1) LIMIT 1`;

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

export const getActiveMembershipByEmailQuery = `-- name: GetActiveMembershipByEmail :one
SELECT id, email, nickname, date_of_birth, phone_number, membership_status, created_at, notes, additional_data FROM whygym.members
WHERE membership_status = 'active' AND email = $1  LIMIT 1`;

export interface GetActiveMembershipByEmailArgs {
    email: string | null;
}

export interface GetActiveMembershipByEmailRow {
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

export async function getActiveMembershipByEmail(client: Client, args: GetActiveMembershipByEmailArgs): Promise<GetActiveMembershipByEmailRow | null> {
    const result = await client.query({
        text: getActiveMembershipByEmailQuery,
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
WHERE id = $1 AND membership_status = 'pending' AND (email = $2 OR additional_data->>'emailPic' = $2) RETURNING id`;

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

export const updateMemberPriceQuery = `-- name: UpdateMemberPrice :one
UPDATE whygym.orders SET updated_at = current_timestamp,
                         price = $1
WHERE id = $2 AND order_status = 'waiting payment method'
RETURNING id`;

export interface UpdateMemberPriceArgs {
    price: string;
    id: number;
}

export interface UpdateMemberPriceRow {
    id: number;
}

export async function updateMemberPrice(client: Client, args: UpdateMemberPriceArgs): Promise<UpdateMemberPriceRow | null> {
    const result = await client.query({
        text: updateMemberPriceQuery,
        values: [args.price, args.id],
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
SELECT 'week ' || ws.week_of_year AS week_number, coalesce(count, 0) AS week_count
FROM week_series ws
    LEFT JOIN data d ON ws.week_of_year = d.week_of_year
    ORDER BY ws.week_of_year ASC`;

export interface GetWeeklyVisitsByEmailArgs {
    email: string | null;
}

export interface GetWeeklyVisitsByEmailRow {
    weekNumber: string | null;
    weekCount: string;
}

export async function getWeeklyVisitsByEmail(client: Client, args: GetWeeklyVisitsByEmailArgs): Promise<GetWeeklyVisitsByEmailRow[]> {
    const result = await client.query({
        text: getWeeklyVisitsByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            weekNumber: row[0],
            weekCount: row[1]
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
SELECT 'month ' || ms.month_of_year AS month_number, coalesce(count, 0) AS month_count
FROM month_series ms
    LEFT JOIN data d ON ms.month_of_year = d.month_of_year
    WHERE ms.month_of_year > 0
    ORDER BY ms.month_of_year ASC`;

export interface GetMonthlyVisitsByEmailArgs {
    email: string | null;
}

export interface GetMonthlyVisitsByEmailRow {
    monthNumber: string | null;
    monthCount: string;
}

export async function getMonthlyVisitsByEmail(client: Client, args: GetMonthlyVisitsByEmailArgs): Promise<GetMonthlyVisitsByEmailRow[]> {
    const result = await client.query({
        text: getMonthlyVisitsByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            monthNumber: row[0],
            monthCount: row[1]
        };
    });
}

export const createMemberOrderQuery = `-- name: CreateMemberOrder :one
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
returning id, main_reference_id, part_id, notes::numeric`;

export interface CreateMemberOrderArgs {
    email: string | null;
    nickname: string;
    dateOfBirth: Date | null;
    phoneNumber: string | null;
    notes: string | null;
    additionalData: any | null;
    price: string;
}

export interface CreateMemberOrderRow {
    id: number;
    mainReferenceId: string;
    partId: number;
    notes: string;
}

export async function createMemberOrder(client: Client, args: CreateMemberOrderArgs): Promise<CreateMemberOrderRow | null> {
    const result = await client.query({
        text: createMemberOrderQuery,
        values: [args.email, args.nickname, args.dateOfBirth, args.phoneNumber, args.notes, args.additionalData, args.price],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        mainReferenceId: row[1],
        partId: row[2],
        notes: row[3]
    };
}

export const createPrivateCoachingOrderQuery = `-- name: CreatePrivateCoachingOrder :one
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
returning id, main_reference_id, part_id, notes::numeric`;

export interface CreatePrivateCoachingOrderArgs {
    email: string;
    memberId: number;
    coachType: string;
    numberOfSessions: number;
    additionalData: any | null;
    price: string;
}

export interface CreatePrivateCoachingOrderRow {
    id: number;
    mainReferenceId: string;
    partId: number;
    notes: string;
}

export async function createPrivateCoachingOrder(client: Client, args: CreatePrivateCoachingOrderArgs): Promise<CreatePrivateCoachingOrderRow | null> {
    const result = await client.query({
        text: createPrivateCoachingOrderQuery,
        values: [args.email, args.memberId, args.coachType, args.numberOfSessions, args.additionalData, args.price],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        mainReferenceId: row[1],
        partId: row[2],
        notes: row[3]
    };
}

export const linkGroupOrderQuery = `-- name: linkGroupOrder :one
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
returning og.part_id, og.main_reference_id`;

export interface linkGroupOrderArgs {
    id: number;
}

export interface linkGroupOrderRow {
    partId: number;
    mainReferenceId: string;
}

export async function linkGroupOrder(client: Client, args: linkGroupOrderArgs): Promise<linkGroupOrderRow | null> {
    const result = await client.query({
        text: linkGroupOrderQuery,
        values: [args.id],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        partId: row[0],
        mainReferenceId: row[1]
    };
}

export const getOrderReferenceIdByEmailQuery = `-- name: GetOrderReferenceIdByEmail :one
SELECT reference_id, m.additional_data, m.nickname, o.created_at, m.id as memberId
FROM whygym.orders o
    INNER JOIN whygym.members m ON o.member_id = m.id
WHERE m.membership_status = 'pending'
    AND m.email = $1
LIMIT 1`;

export interface GetOrderReferenceIdByEmailArgs {
    email: string | null;
}

export interface GetOrderReferenceIdByEmailRow {
    referenceId: string;
    additionalData: any | null;
    nickname: string;
    createdAt: Date | null;
    memberid: number;
}

export async function getOrderReferenceIdByEmail(client: Client, args: GetOrderReferenceIdByEmailArgs): Promise<GetOrderReferenceIdByEmailRow | null> {
    const result = await client.query({
        text: getOrderReferenceIdByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        referenceId: row[0],
        additionalData: row[1],
        nickname: row[2],
        createdAt: row[3],
        memberid: row[4]
    };
}

export const getPrivateCoachingOrderReferenceIdByEmailQuery = `-- name: GetPrivateCoachingOrderReferenceIdByEmail :one
SELECT reference_id, pc.additional_data, o.created_at, pc.member_id
FROM whygym.orders o
    INNER JOIN whygym.private_coaching pc ON o.private_coaching_id = pc.id
WHERE pc.status = 'pending'
    AND pc.email = $1
LIMIT 1`;

export interface GetPrivateCoachingOrderReferenceIdByEmailArgs {
    email: string;
}

export interface GetPrivateCoachingOrderReferenceIdByEmailRow {
    referenceId: string;
    additionalData: any | null;
    createdAt: Date | null;
    memberId: number;
}

export async function getPrivateCoachingOrderReferenceIdByEmail(client: Client, args: GetPrivateCoachingOrderReferenceIdByEmailArgs): Promise<GetPrivateCoachingOrderReferenceIdByEmailRow | null> {
    const result = await client.query({
        text: getPrivateCoachingOrderReferenceIdByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        referenceId: row[0],
        additionalData: row[1],
        createdAt: row[2],
        memberId: row[3]
    };
}

export const getOrderByReferenceIdQuery = `-- name: getOrderByReferenceId :one
SELECT id, member_id, price, reference_id, order_status, url, created_at, 
       updated_at, notes, additional_info, private_coaching_id
FROM whygym.orders
WHERE reference_id = $1
LIMIT 1`;

export interface getOrderByReferenceIdArgs {
    referenceId: string;
}

export interface getOrderByReferenceIdRow {
    id: number;
    memberId: number | null;
    price: string;
    referenceId: string;
    orderStatus: string;
    url: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    notes: string | null;
    additionalInfo: any | null;
    privateCoachingId: number | null;
}

export async function getOrderByReferenceId(client: Client, args: getOrderByReferenceIdArgs): Promise<getOrderByReferenceIdRow | null> {
    const result = await client.query({
        text: getOrderByReferenceIdQuery,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        memberId: row[1],
        price: row[2],
        referenceId: row[3],
        orderStatus: row[4],
        url: row[5],
        createdAt: row[6],
        updatedAt: row[7],
        notes: row[8],
        additionalInfo: row[9],
        privateCoachingId: row[10]
    };
}

export const getWaitingPaymentOrdersQuery = `-- name: getWaitingPaymentOrders :many
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
    order by o.created_at desc`;

export interface getWaitingPaymentOrdersRow {
    id: number;
    price: string;
    referenceId: string;
    memberId: number | null;
    orderStatus: string;
    additionalInfo: any | null;
    email: string | null;
    nickname: string;
    additionalData: any | null;
}

export async function getWaitingPaymentOrders(client: Client): Promise<getWaitingPaymentOrdersRow[]> {
    const result = await client.query({
        text: getWaitingPaymentOrdersQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            price: row[1],
            referenceId: row[2],
            memberId: row[3],
            orderStatus: row[4],
            additionalInfo: row[5],
            email: row[6],
            nickname: row[7],
            additionalData: row[8]
        };
    });
}

export const turnOnCashback100Query = `-- name: turnOnCashback100 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback100": true, "cashback200": false, "cashback50": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOnCashback100Args {
    referenceId: string;
}

export interface turnOnCashback100Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOnCashback100(client: Client, args: turnOnCashback100Args): Promise<turnOnCashback100Row | null> {
    const result = await client.query({
        text: turnOnCashback100Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOffCashback100Query = `-- name: turnOffCashback100 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback100": false}'::jsonb, 
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOffCashback100Args {
    referenceId: string;
}

export interface turnOffCashback100Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOffCashback100(client: Client, args: turnOffCashback100Args): Promise<turnOffCashback100Row | null> {
    const result = await client.query({
        text: turnOffCashback100Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOnCashback200Query = `-- name: turnOnCashback200 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback100": false, "cashback200": true, "cashback50": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOnCashback200Args {
    referenceId: string;
}

export interface turnOnCashback200Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOnCashback200(client: Client, args: turnOnCashback200Args): Promise<turnOnCashback200Row | null> {
    const result = await client.query({
        text: turnOnCashback200Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOffCashback200Query = `-- name: turnOffCashback200 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback200": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOffCashback200Args {
    referenceId: string;
}

export interface turnOffCashback200Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOffCashback200(client: Client, args: turnOffCashback200Args): Promise<turnOffCashback200Row | null> {
    const result = await client.query({
        text: turnOffCashback200Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOnCashback50Query = `-- name: turnOnCashback50 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback100": false, "cashback200": false, "cashback50": true}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOnCashback50Args {
    referenceId: string;
}

export interface turnOnCashback50Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOnCashback50(client: Client, args: turnOnCashback50Args): Promise<turnOnCashback50Row | null> {
    const result = await client.query({
        text: turnOnCashback50Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOffCashback50Query = `-- name: turnOffCashback50 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"cashback50": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOffCashback50Args {
    referenceId: string;
}

export interface turnOffCashback50Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOffCashback50(client: Client, args: turnOffCashback50Args): Promise<turnOffCashback50Row | null> {
    const result = await client.query({
        text: turnOffCashback50Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOnExtend30Query = `-- name: turnOnExtend30 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend15": false, "extend30": true, "extend60": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOnExtend30Args {
    referenceId: string;
}

export interface turnOnExtend30Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOnExtend30(client: Client, args: turnOnExtend30Args): Promise<turnOnExtend30Row | null> {
    const result = await client.query({
        text: turnOnExtend30Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOffExtend30Query = `-- name: turnOffExtend30 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend30": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOffExtend30Args {
    referenceId: string;
}

export interface turnOffExtend30Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOffExtend30(client: Client, args: turnOffExtend30Args): Promise<turnOffExtend30Row | null> {
    const result = await client.query({
        text: turnOffExtend30Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOnExtend60Query = `-- name: turnOnExtend60 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend15": false, "extend30": false, "extend60": true}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOnExtend60Args {
    referenceId: string;
}

export interface turnOnExtend60Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOnExtend60(client: Client, args: turnOnExtend60Args): Promise<turnOnExtend60Row | null> {
    const result = await client.query({
        text: turnOnExtend60Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOffExtend60Query = `-- name: turnOffExtend60 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend60": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOffExtend60Args {
    referenceId: string;
}

export interface turnOffExtend60Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOffExtend60(client: Client, args: turnOffExtend60Args): Promise<turnOffExtend60Row | null> {
    const result = await client.query({
        text: turnOffExtend60Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOnExtend15Query = `-- name: turnOnExtend15 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend15": true, "extend30": false, "extend60": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOnExtend15Args {
    referenceId: string;
}

export interface turnOnExtend15Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOnExtend15(client: Client, args: turnOnExtend15Args): Promise<turnOnExtend15Row | null> {
    const result = await client.query({
        text: turnOnExtend15Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const turnOffExtend15Query = `-- name: turnOffExtend15 :one
UPDATE whygym.orders
SET additional_info = COALESCE(additional_info, '{}'::jsonb) || '{"extend15": false}'::jsonb,
    updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOffExtend15Args {
    referenceId: string;
}

export interface turnOffExtend15Row {
    id: number;
    additionalInfo: any | null;
    referenceId: string;
}

export async function turnOffExtend15(client: Client, args: turnOffExtend15Args): Promise<turnOffExtend15Row | null> {
    const result = await client.query({
        text: turnOffExtend15Query,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        additionalInfo: row[1],
        referenceId: row[2]
    };
}

export const insertOrderStatusLogQuery = `-- name: insertOrderStatusLog :one
INSERT INTO whygym.orders_status_log (reference_id, order_status, notes, additional_info)
VALUES ($1, $2, $3, $4)
RETURNING id, reference_id, order_status, notes, additional_info`;

export interface insertOrderStatusLogArgs {
    referenceId: string;
    orderStatus: string;
    notes: string | null;
    additionalInfo: any | null;
}

export interface insertOrderStatusLogRow {
    id: number;
    referenceId: string;
    orderStatus: string;
    notes: string | null;
    additionalInfo: any | null;
}

export async function insertOrderStatusLog(client: Client, args: insertOrderStatusLogArgs): Promise<insertOrderStatusLogRow | null> {
    const result = await client.query({
        text: insertOrderStatusLogQuery,
        values: [args.referenceId, args.orderStatus, args.notes, args.additionalInfo],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        referenceId: row[1],
        orderStatus: row[2],
        notes: row[3],
        additionalInfo: row[4]
    };
}

export const getOrderAndMemberByReferenceIdQuery = `-- name: getOrderAndMemberByReferenceId :one
SELECT o.id, o.member_id, o.price, o.reference_id, o.order_status, o.url, o.created_at, o.updated_at, o.notes, 
       o.additional_info, m.email, m.nickname, m.additional_data, m.phone_number
FROM whygym.orders o
    INNER JOIN whygym.members m ON o.member_id = m.id   
WHERE o.reference_id = $1
LIMIT 1`;

export interface getOrderAndMemberByReferenceIdArgs {
    referenceId: string;
}

export interface getOrderAndMemberByReferenceIdRow {
    id: number;
    memberId: number | null;
    price: string;
    referenceId: string;
    orderStatus: string;
    url: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    notes: string | null;
    additionalInfo: any | null;
    email: string | null;
    nickname: string;
    additionalData: any | null;
    phoneNumber: string | null;
}

export async function getOrderAndMemberByReferenceId(client: Client, args: getOrderAndMemberByReferenceIdArgs): Promise<getOrderAndMemberByReferenceIdRow | null> {
    const result = await client.query({
        text: getOrderAndMemberByReferenceIdQuery,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        memberId: row[1],
        price: row[2],
        referenceId: row[3],
        orderStatus: row[4],
        url: row[5],
        createdAt: row[6],
        updatedAt: row[7],
        notes: row[8],
        additionalInfo: row[9],
        email: row[10],
        nickname: row[11],
        additionalData: row[12],
        phoneNumber: row[13]
    };
}

export const getOrderAndPrivateCoachingByReferenceIdQuery = `-- name: getOrderAndPrivateCoachingByReferenceId :one
SELECT o.id, o.member_id, o.price, o.reference_id, o.order_status, o.url, o.created_at, o.updated_at, o.notes,
       o.additional_info, pc.email, pc.additional_data
FROM whygym.orders o
    INNER JOIN whygym.private_coaching pc ON o.private_coaching_id = pc.id
WHERE o.reference_id = $1
LIMIT 1`;

export interface getOrderAndPrivateCoachingByReferenceIdArgs {
    referenceId: string;
}

export interface getOrderAndPrivateCoachingByReferenceIdRow {
    id: number;
    memberId: number | null;
    price: string;
    referenceId: string;
    orderStatus: string;
    url: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    notes: string | null;
    additionalInfo: any | null;
    email: string;
    additionalData: any | null;
}

export async function getOrderAndPrivateCoachingByReferenceId(client: Client, args: getOrderAndPrivateCoachingByReferenceIdArgs): Promise<getOrderAndPrivateCoachingByReferenceIdRow | null> {
    const result = await client.query({
        text: getOrderAndPrivateCoachingByReferenceIdQuery,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        memberId: row[1],
        price: row[2],
        referenceId: row[3],
        orderStatus: row[4],
        url: row[5],
        createdAt: row[6],
        updatedAt: row[7],
        notes: row[8],
        additionalInfo: row[9],
        email: row[10],
        additionalData: row[11]
    };
}

export const getUserRolesQuery = `-- name: getUserRoles :many
SELECT name as roles FROM whygym.user_roles ur
    INNER JOIN whygym.roles r ON r.id =  ur.role_id
    WHERE ur.user_id = $1`;

export interface getUserRolesArgs {
    userId: number;
}

export interface getUserRolesRow {
    roles: string;
}

export async function getUserRoles(client: Client, args: getUserRolesArgs): Promise<getUserRolesRow[]> {
    const result = await client.query({
        text: getUserRolesQuery,
        values: [args.userId],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            roles: row[0]
        };
    });
}

export const getPaymentUrlByReferenceIdQuery = `-- name: getPaymentUrlByReferenceId :one
SELECT additional_info->'invoice_response'->'data'->'paymentUrl' AS paymentUrl
FROM whygym.orders WHERE reference_id = $1
    AND additional_info->'invoice_response'->'data'->'paymentUrl' IS NOT NULL
LIMIT 1`;

export interface getPaymentUrlByReferenceIdArgs {
    referenceId: string;
}

export interface getPaymentUrlByReferenceIdRow {
    paymenturl: string | null;
}

export async function getPaymentUrlByReferenceId(client: Client, args: getPaymentUrlByReferenceIdArgs): Promise<getPaymentUrlByReferenceIdRow | null> {
    const result = await client.query({
        text: getPaymentUrlByReferenceIdQuery,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        paymenturl: row[0]
    };
}

export const getPotentialGroupDataQuery = `-- name: getPotentialGroupData :many
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
WHERE m.membership_status = 'pending' ORDER BY m.nickname LIMIT 10`;

export interface getPotentialGroupDataArgs {
    email: string | null;
}

export interface getPotentialGroupDataRow {
    id: number;
    email: string | null;
    nickname: string;
    gender: string | null;
    duration: string | null;
    checked: boolean;
}

export async function getPotentialGroupData(client: Client, args: getPotentialGroupDataArgs): Promise<getPotentialGroupDataRow[]> {
    const result = await client.query({
        text: getPotentialGroupDataQuery,
        values: [args.email],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            email: row[1],
            nickname: row[2],
            gender: row[3],
            duration: row[4],
            checked: row[5]
        };
    });
}

export const getPotentialPrivateCoachingGroupDataQuery = `-- name: getPotentialPrivateCoachingGroupData :many
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
WHERE m.status = 'pending' ORDER BY m.email LIMIT 10`;

export interface getPotentialPrivateCoachingGroupDataArgs {
    email: string;
}

export interface getPotentialPrivateCoachingGroupDataRow {
    id: number;
    email: string;
    gender: string | null;
    coachType: string;
    checked: boolean;
}

export async function getPotentialPrivateCoachingGroupData(client: Client, args: getPotentialPrivateCoachingGroupDataArgs): Promise<getPotentialPrivateCoachingGroupDataRow[]> {
    const result = await client.query({
        text: getPotentialPrivateCoachingGroupDataQuery,
        values: [args.email],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            email: row[1],
            gender: row[2],
            coachType: row[3],
            checked: row[4]
        };
    });
}

export const joinToGroupQuery = `-- name: joinToGroup :one
UPDATE whygym.order_groups SET updated_at = current_timestamp,
                               main_reference_id = $1
WHERE part_id = $2
RETURNING id, main_reference_id, part_id, part_reference_id`;

export interface joinToGroupArgs {
    mainReferenceId: string;
    partId: number;
}

export interface joinToGroupRow {
    id: number;
    mainReferenceId: string;
    partId: number;
    partReferenceId: string;
}

export async function joinToGroup(client: Client, args: joinToGroupArgs): Promise<joinToGroupRow | null> {
    const result = await client.query({
        text: joinToGroupQuery,
        values: [args.mainReferenceId, args.partId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        mainReferenceId: row[1],
        partId: row[2],
        partReferenceId: row[3]
    };
}

export const removeFromGroupQuery = `-- name: removeFromGroup :one
UPDATE whygym.order_groups SET updated_at = current_timestamp,
                               main_reference_id = part_reference_id
WHERE part_id = $1
RETURNING id, main_reference_id, part_id, part_reference_id`;

export interface removeFromGroupArgs {
    partId: number;
}

export interface removeFromGroupRow {
    id: number;
    mainReferenceId: string;
    partId: number;
    partReferenceId: string;
}

export async function removeFromGroup(client: Client, args: removeFromGroupArgs): Promise<removeFromGroupRow | null> {
    const result = await client.query({
        text: removeFromGroupQuery,
        values: [args.partId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        mainReferenceId: row[1],
        partId: row[2],
        partReferenceId: row[3]
    };
}

export const getActiveMemberBreakdownQuery = `-- name: getActiveMemberBreakdown :many
with groups as (
  select main_reference_id, count(*) as count from whygym.order_groups group by main_reference_id having count(*) > 1
),
group_counts AS (
  select og.part_reference_id, coalesce(g.count, 1) as count from whygym.order_groups og left join groups g on og.main_reference_id = g.main_reference_id
),
extra_times AS (
    select member_id, sum(extra_time) as total_extra from whygym.order_extra_time group by member_id
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
       m.start_date,
       m.id,
       e.total_extra
from whygym.members m
    left outer join whygym.orders o on m.id = o.member_id AND o.private_coaching_id is null
    left join group_counts g on o.reference_id = g.part_reference_id
    left join extra_times e on m.id = e.member_id
where m.membership_status = 'active'
order by m.id desc`;

export interface getActiveMemberBreakdownRow {
    email: string | null;
    gender: string | null;
    promoType: string | null;
    groupType: string;
    duration: string | null;
    count: string | null;
    startDate: Date | null;
    id: number;
    totalExtra: string | null;
}

export async function getActiveMemberBreakdown(client: Client): Promise<getActiveMemberBreakdownRow[]> {
    const result = await client.query({
        text: getActiveMemberBreakdownQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            email: row[0],
            gender: row[1],
            promoType: row[2],
            groupType: row[3],
            duration: row[4],
            count: row[5],
            startDate: row[6],
            id: row[7],
            totalExtra: row[8]
        };
    });
}

export const getMemberActiveDateQuery = `-- name: getMemberActiveDate :one
WITH data as (
select
    start_date,
    additional_data->>'duration' || ' days' as duration,
    id
from whygym.members where email = $1 and membership_status = 'active' limit 1)
select data.start_date, data.duration,  (data.start_date + data.duration::interval)::date as end_date, data.id
from data limit 1`;

export interface getMemberActiveDateArgs {
    email: string | null;
}

export interface getMemberActiveDateRow {
    startDate: Date | null;
    duration: string | null;
    endDate: Date;
    id: number;
}

export async function getMemberActiveDate(client: Client, args: getMemberActiveDateArgs): Promise<getMemberActiveDateRow | null> {
    const result = await client.query({
        text: getMemberActiveDateQuery,
        values: [args.email],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        startDate: row[0],
        duration: row[1],
        endDate: row[2],
        id: row[3]
    };
}

export const getAccountingDataQuery = `-- name: getAccountingData :many
select m.email,
       m.additional_data->>'fullName' as name,
       m.additional_data->>'emailPic' as buyer,
       m.additional_data->>'gender' as gender,
       m.additional_data->>'duration' as duration,
       ((o.additional_info->>'invoice_response')::jsonb->>'data')::jsonb->>'amount' as amount,
       (((o.additional_info->>'invoice_response')::jsonb->>'data')::jsonb->>'paidAt')::date as paid,
       count(m.email) over (partition by m.additional_data->>'emailPic'),
       m.id as member_id,
       m.additional_data->>'frontOfficer' as frontOfficer
from whygym.members m
 inner join whygym.orders o on m.id = o.member_id AND o.private_coaching_id is null
where m.start_date > '2025-04-03' and m.membership_status = 'active'
order by m.created_at desc, amount desc, m.additional_data->>'emailPic'`;

export interface getAccountingDataRow {
    email: string | null;
    name: string | null;
    buyer: string | null;
    gender: string | null;
    duration: string | null;
    amount: string | null;
    paid: Date;
    count: string;
    memberId: number;
    frontofficer: string | null;
}

export async function getAccountingData(client: Client): Promise<getAccountingDataRow[]> {
    const result = await client.query({
        text: getAccountingDataQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            email: row[0],
            name: row[1],
            buyer: row[2],
            gender: row[3],
            duration: row[4],
            amount: row[5],
            paid: row[6],
            count: row[7],
            memberId: row[8],
            frontofficer: row[9]
        };
    });
}

export const getMemberDurationDataQuery = `-- name: getMemberDurationData :many
select m.id, m.additional_data->>'duration' as base_duration,
       m.additional_data->>'extend15' as extend15,
       m.additional_data->>'extend30' as extend30,
       m.additional_data->>'extend60' as extend60,
       oet.extra_time as extra_time
from whygym.members m
    left join whygym.order_extra_time oet on m.id = oet.member_id
where m.id = $1
limit 100`;

export interface getMemberDurationDataArgs {
    id: number;
}

export interface getMemberDurationDataRow {
    id: number;
    baseDuration: string | null;
    extend15: string | null;
    extend30: string | null;
    extend60: string | null;
    extraTime: number | null;
}

export async function getMemberDurationData(client: Client, args: getMemberDurationDataArgs): Promise<getMemberDurationDataRow[]> {
    const result = await client.query({
        text: getMemberDurationDataQuery,
        values: [args.id],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            baseDuration: row[1],
            extend15: row[2],
            extend30: row[3],
            extend60: row[4],
            extraTime: row[5]
        };
    });
}

export const getAccountingDataPrivateCoachingQuery = `-- name: getAccountingDataPrivateCoaching :many
select p.id,
       p.additional_data->>'trainingType' as training_type,
       p.additional_data->>'sessionCount' as session_count,
       p.email,
       p.additional_data->>'partnerEmail' as buyer,
       p.additional_data->>'trainingType' as training_type,
       p.additional_data->>'coachType' as coachType,
       ((o.additional_info->>'invoice_response')::jsonb->>'data')::jsonb->>'amount' as amount,
       (((o.additional_info->>'invoice_response')::jsonb->>'data')::jsonb->>'paidAt')::date as paid,
       o.additional_info,
       o.created_at
from whygym.private_coaching p
inner join whygym.orders o on p.id = o.private_coaching_id
where p.status = 'active'
order by p.created_at desc`;

export interface getAccountingDataPrivateCoachingRow {
    id: number;
    trainingType: string | null;
    sessionCount: string | null;
    email: string;
    buyer: string | null;
    trainingType_2: string | null;
    coachtype: string | null;
    amount: string | null;
    paid: Date;
    additionalInfo: any | null;
    createdAt: Date | null;
}

export async function getAccountingDataPrivateCoaching(client: Client): Promise<getAccountingDataPrivateCoachingRow[]> {
    const result = await client.query({
        text: getAccountingDataPrivateCoachingQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            id: row[0],
            trainingType: row[1],
            sessionCount: row[2],
            email: row[3],
            buyer: row[4],
            trainingType_2: row[5],
            coachtype: row[6],
            amount: row[7],
            paid: row[8],
            additionalInfo: row[9],
            createdAt: row[10]
        };
    });
}

export const getConfigQuery = `-- name: getConfig :one
SELECT value_string, value_integer, value_datetime, value_boolean, value_jsonb
FROM whygym.config
WHERE key = $1`;

export interface getConfigArgs {
    key: string;
}

export interface getConfigRow {
    valueString: string | null;
    valueInteger: number | null;
    valueDatetime: Date | null;
    valueBoolean: boolean | null;
    valueJsonb: any | null;
}

export async function getConfig(client: Client, args: getConfigArgs): Promise<getConfigRow | null> {
    const result = await client.query({
        text: getConfigQuery,
        values: [args.key],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        valueString: row[0],
        valueInteger: row[1],
        valueDatetime: row[2],
        valueBoolean: row[3],
        valueJsonb: row[4]
    };
}

export const insertOrUpdateConfigQuery = `-- name: InsertOrUpdateConfig :one
INSERT INTO whygym.config (key, value_string, value_integer, value_datetime, value_boolean, value_jsonb)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (key) DO UPDATE SET
    value_string = $2,
    value_integer = $3,
    value_datetime = $4,
    value_boolean = $5, 
    value_jsonb = $6
RETURNING id, key, value_string, value_integer, value_datetime, value_boolean, value_jsonb`;

export interface InsertOrUpdateConfigArgs {
    key: string;
    valueString: string | null;
    valueInteger: number | null;
    valueDatetime: Date | null;
    valueBoolean: boolean | null;
    valueJsonb: any | null;
}

export interface InsertOrUpdateConfigRow {
    id: number;
    key: string;
    valueString: string | null;
    valueInteger: number | null;
    valueDatetime: Date | null;
    valueBoolean: boolean | null;
    valueJsonb: any | null;
}

export async function insertOrUpdateConfig(client: Client, args: InsertOrUpdateConfigArgs): Promise<InsertOrUpdateConfigRow | null> {
    const result = await client.query({
        text: insertOrUpdateConfigQuery,
        values: [args.key, args.valueString, args.valueInteger, args.valueDatetime, args.valueBoolean, args.valueJsonb],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        key: row[1],
        valueString: row[2],
        valueInteger: row[3],
        valueDatetime: row[4],
        valueBoolean: row[5],
        valueJsonb: row[6]
    };
}

export const createExtensionOrderQuery = `-- name: CreateExtensionOrder :one
INSERT INTO whygym.extension_orders (
    member_id,
    member_email,
    duration_days
)
VALUES ($1, $2, $3)
RETURNING id, member_id, member_email, reference_id, duration_days`;

export interface CreateExtensionOrderArgs {
    memberId: number;
    memberEmail: string;
    durationDays: number;
}

export interface CreateExtensionOrderRow {
    id: number;
    memberId: number;
    memberEmail: string;
    referenceId: string;
    durationDays: number;
}

export async function createExtensionOrder(client: Client, args: CreateExtensionOrderArgs): Promise<CreateExtensionOrderRow | null> {
    const result = await client.query({
        text: createExtensionOrderQuery,
        values: [args.memberId, args.memberEmail, args.durationDays],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        memberId: row[1],
        memberEmail: row[2],
        referenceId: row[3],
        durationDays: row[4]
    };
}

export const getExtensionOrderQuery = `-- name: getExtensionOrder :one
SELECT id, member_id, member_email, reference_id, duration_days
FROM whygym.extension_orders
WHERE reference_id = $1
LIMIT 1`;

export interface getExtensionOrderArgs {
    referenceId: string;
}

export interface getExtensionOrderRow {
    id: number;
    memberId: number;
    memberEmail: string;
    referenceId: string;
    durationDays: number;
}

export async function getExtensionOrder(client: Client, args: getExtensionOrderArgs): Promise<getExtensionOrderRow | null> {
    const result = await client.query({
        text: getExtensionOrderQuery,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        memberId: row[1],
        memberEmail: row[2],
        referenceId: row[3],
        durationDays: row[4]
    };
}

export const insertExtensionOrderStatusLogQuery = `-- name: InsertExtensionOrderStatusLog :one
INSERT INTO whygym.extension_orders_status_log (
    reference_id,
    extension_order_status,
    notes,
    additional_info
)
VALUES ($1, $2, $3, $4)
RETURNING id, reference_id, extension_order_status, notes, additional_info`;

export interface InsertExtensionOrderStatusLogArgs {
    referenceId: string;
    extensionOrderStatus: string;
    notes: string | null;
    additionalInfo: any | null;
}

export interface InsertExtensionOrderStatusLogRow {
    id: number;
    referenceId: string;
    extensionOrderStatus: string;
    notes: string | null;
    additionalInfo: any | null;
}

export async function insertExtensionOrderStatusLog(client: Client, args: InsertExtensionOrderStatusLogArgs): Promise<InsertExtensionOrderStatusLogRow | null> {
    const result = await client.query({
        text: insertExtensionOrderStatusLogQuery,
        values: [args.referenceId, args.extensionOrderStatus, args.notes, args.additionalInfo],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        referenceId: row[1],
        extensionOrderStatus: row[2],
        notes: row[3],
        additionalInfo: row[4]
    };
}

export const getExtensionInvoiceIdByReferenceIdQuery = `-- name: getExtensionInvoiceIdByReferenceId :one
select ((additional_info->>'response')::jsonb->>'data')::jsonb->>'id' as invoice_id
from whygym.extension_orders_status_log
where extension_order_status = 'process-payment-response' and reference_id = $1
order by created_at desc limit 1`;

export interface getExtensionInvoiceIdByReferenceIdArgs {
    referenceId: string;
}

export interface getExtensionInvoiceIdByReferenceIdRow {
    invoiceId: string | null;
}

export async function getExtensionInvoiceIdByReferenceId(client: Client, args: getExtensionInvoiceIdByReferenceIdArgs): Promise<getExtensionInvoiceIdByReferenceIdRow | null> {
    const result = await client.query({
        text: getExtensionInvoiceIdByReferenceIdQuery,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        invoiceId: row[0]
    };
}

export const getPaidPaymentInvoiceResponseByReferenceIdQuery = `-- name: getPaidPaymentInvoiceResponseByReferenceId :one
select additional_info->>'response' as response
from whygym.extension_orders_status_log
where extension_order_status = 'get-payment-invoice-response' 
    and reference_id = $1
    and ((additional_info->>'response')::jsonb->>'data')::jsonb->>'status' = 'PAID'
order by created_at desc limit 1`;

export interface getPaidPaymentInvoiceResponseByReferenceIdArgs {
    referenceId: string;
}

export interface getPaidPaymentInvoiceResponseByReferenceIdRow {
    response: string | null;
}

export async function getPaidPaymentInvoiceResponseByReferenceId(client: Client, args: getPaidPaymentInvoiceResponseByReferenceIdArgs): Promise<getPaidPaymentInvoiceResponseByReferenceIdRow | null> {
    const result = await client.query({
        text: getPaidPaymentInvoiceResponseByReferenceIdQuery,
        values: [args.referenceId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        response: row[0]
    };
}

export const addExtraTimeQuery = `-- name: addExtraTime :one
INSERT INTO whygym.order_extra_time (
    member_id,
    extra_time,
    reason,
    order_reference_id,
    created_by
)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, member_id, extra_time, reason, order_reference_id`;

export interface addExtraTimeArgs {
    memberId: number;
    extraTime: number;
    reason: string | null;
    orderReferenceId: string;
    createdBy: number | null;
}

export interface addExtraTimeRow {
    id: number;
    memberId: number;
    extraTime: number;
    reason: string | null;
    orderReferenceId: string;
}

export async function addExtraTime(client: Client, args: addExtraTimeArgs): Promise<addExtraTimeRow | null> {
    const result = await client.query({
        text: addExtraTimeQuery,
        values: [args.memberId, args.extraTime, args.reason, args.orderReferenceId, args.createdBy],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        memberId: row[1],
        extraTime: row[2],
        reason: row[3],
        orderReferenceId: row[4]
    };
}

export const setExtensionOrderStatusQuery = `-- name: setExtensionOrderStatus :one
UPDATE whygym.extension_orders
SET updated_at = current_timestamp,
    status = $2
WHERE reference_id = $1
RETURNING id, member_id, member_email, reference_id, duration_days, status`;

export interface setExtensionOrderStatusArgs {
    referenceId: string;
    status: string;
}

export interface setExtensionOrderStatusRow {
    id: number;
    memberId: number;
    memberEmail: string;
    referenceId: string;
    durationDays: number;
    status: string;
}

export async function setExtensionOrderStatus(client: Client, args: setExtensionOrderStatusArgs): Promise<setExtensionOrderStatusRow | null> {
    const result = await client.query({
        text: setExtensionOrderStatusQuery,
        values: [args.referenceId, args.status],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        memberId: row[1],
        memberEmail: row[2],
        referenceId: row[3],
        durationDays: row[4],
        status: row[5]
    };
}

