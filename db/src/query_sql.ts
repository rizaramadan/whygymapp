import { QueryArrayConfig, QueryArrayResult } from 'pg';

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

export async function getAllUsersRoles(
  client: Client,
): Promise<GetAllUsersRolesRow[]> {
  const result = await client.query({
    text: getAllUsersRolesQuery,
    values: [],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      id: row[0],
      username: row[1],
      password: row[2],
      email: row[3],
      role: row[4],
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

export async function getUserByEmail(
  client: Client,
  args: GetUserByEmailArgs,
): Promise<GetUserByEmailRow | null> {
  const result = await client.query({
    text: getUserByEmailQuery,
    values: [args.email],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    username: row[1],
    password: row[2],
    roles: row[3],
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

export async function getTodayVisits(
  client: Client,
): Promise<GetTodayVisitsRow[]> {
  const result = await client.query({
    text: getTodayVisitsQuery,
    values: [],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      id: row[0],
      memberId: row[1],
      email: row[2],
      picUrl: row[3],
      checkInTime: row[4],
      visitCode: row[5],
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

export async function createVisit(
  client: Client,
  args: CreateVisitArgs,
): Promise<CreateVisitRow | null> {
  const result = await client.query({
    text: createVisitQuery,
    values: [args.memberId, args.email, args.picUrl],
    rowMode: 'array',
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
    visitCode: row[5],
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

export async function getMemberIdByEmail(
  client: Client,
  args: GetMemberIdByEmailArgs,
): Promise<GetMemberIdByEmailRow | null> {
  const result = await client.query({
    text: getMemberIdByEmailQuery,
    values: [args.email],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
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

export async function getVisitsAfterId(
  client: Client,
  args: GetVisitsAfterIdArgs,
): Promise<GetVisitsAfterIdRow[]> {
  const result = await client.query({
    text: getVisitsAfterIdQuery,
    values: [args.id],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      id: row[0],
      memberId: row[1],
      email: row[2],
      picUrl: row[3],
      checkInTime: row[4],
      visitCode: row[5],
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

export async function getLastVisitId(
  client: Client,
): Promise<GetLastVisitIdRow | null> {
  const result = await client.query({
    text: getLastVisitIdQuery,
    values: [],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
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

export async function createUserRequest(
  client: Client,
  args: CreateUserRequestArgs,
): Promise<CreateUserRequestRow | null> {
  const result = await client.query({
    text: createUserRequestQuery,
    values: [args.username, args.password, args.email],
    rowMode: 'array',
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
    updatedAt: row[6],
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

export async function approveUserRequest(
  client: Client,
  args: ApproveUserRequestArgs,
): Promise<ApproveUserRequestRow | null> {
  const result = await client.query({
    text: approveUserRequestQuery,
    values: [args.approvedBy, args.id],
    rowMode: 'array',
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
    updatedAt: row[6],
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

export async function rejectUserRequest(
  client: Client,
  args: RejectUserRequestArgs,
): Promise<RejectUserRequestRow | null> {
  const result = await client.query({
    text: rejectUserRequestQuery,
    values: [args.approvedBy, args.id],
    rowMode: 'array',
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
    updatedAt: row[6],
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

export async function getPendingUserRequests(
  client: Client,
): Promise<GetPendingUserRequestsRow[]> {
  const result = await client.query({
    text: getPendingUserRequestsQuery,
    values: [],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      id: row[0],
      username: row[1],
      password: row[2],
      email: row[3],
      status: row[4],
      createdAt: row[5],
      updatedAt: row[6],
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

export async function getUserRequests(
  client: Client,
): Promise<GetUserRequestsRow[]> {
  const result = await client.query({
    text: getUserRequestsQuery,
    values: [],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      id: row[0],
      username: row[1],
      password: row[2],
      email: row[3],
      status: row[4],
      createdAt: row[5],
      updatedAt: row[6],
      approvedBy: row[7],
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

export async function approveAndApplyUser(
  client: Client,
  args: ApproveAndApplyUserArgs,
): Promise<ApproveAndApplyUserRow | null> {
  const result = await client.query({
    text: approveAndApplyUserQuery,
    values: [args.approvedBy, args.id],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    username: row[0],
    password: row[1],
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

export async function checkUserCredentials(
  client: Client,
  args: CheckUserCredentialsArgs,
): Promise<CheckUserCredentialsRow | null> {
  const result = await client.query({
    text: checkUserCredentialsQuery,
    values: [args.username, args.crypt],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    count: row[0],
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

export async function getUserByUsername(
  client: Client,
  args: GetUserByUsernameArgs,
): Promise<GetUserByUsernameRow | null> {
  const result = await client.query({
    text: getUserByUsernameQuery,
    values: [args.username],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    username: row[1],
    password: row[2],
    roles: row[3],
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

export async function createAndGetUser(
  client: Client,
  args: CreateAndGetUserArgs,
): Promise<CreateAndGetUserRow | null> {
  const result = await client.query({
    text: createAndGetUserQuery,
    values: [args.email, args.username, args.md5],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    username: row[1],
    password: row[2],
    roles: row[3],
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

export async function addOrUpdateUserPicture(
  client: Client,
  args: AddOrUpdateUserPictureArgs,
): Promise<AddOrUpdateUserPictureRow | null> {
  const result = await client.query({
    text: addOrUpdateUserPictureQuery,
    values: [args.userId, args.value],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    userId: row[1],
    key: row[2],
    value: row[3],
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

export async function getUserPicture(
  client: Client,
  args: GetUserPictureArgs,
): Promise<GetUserPictureRow | null> {
  const result = await client.query({
    text: getUserPictureQuery,
    values: [args.userId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    value: row[0],
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

export async function createMemberByEmail(
  client: Client,
  args: CreateMemberByEmailArgs,
): Promise<CreateMemberByEmailRow | null> {
  const result = await client.query({
    text: createMemberByEmailQuery,
    values: [
      args.email,
      args.nickname,
      args.dateOfBirth,
      args.phoneNumber,
      args.membershipStatus,
      args.notes,
      args.additionalData,
    ],
    rowMode: 'array',
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
    updatedAt: row[9],
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

export async function createMemberByUsername(
  client: Client,
  args: CreateMemberByUsernameArgs,
): Promise<CreateMemberByUsernameRow | null> {
  const result = await client.query({
    text: createMemberByUsernameQuery,
    values: [
      args.email,
      args.nickname,
      args.dateOfBirth,
      args.phoneNumber,
      args.membershipStatus,
      args.additionalData,
    ],
    rowMode: 'array',
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
    updatedAt: row[9],
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

export async function getPendingMembershipByEmail(
  client: Client,
  args: GetPendingMembershipByEmailArgs,
): Promise<GetPendingMembershipByEmailRow | null> {
  const result = await client.query({
    text: getPendingMembershipByEmailQuery,
    values: [args.email],
    rowMode: 'array',
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
    additionalData: row[8],
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

export async function getActiveMembershipByEmail(
  client: Client,
  args: GetActiveMembershipByEmailArgs,
): Promise<GetActiveMembershipByEmailRow | null> {
  const result = await client.query({
    text: getActiveMembershipByEmailQuery,
    values: [args.email],
    rowMode: 'array',
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
    additionalData: row[8],
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

export async function deletePendingMembership(
  client: Client,
  args: DeletePendingMembershipArgs,
): Promise<DeletePendingMembershipRow | null> {
  const result = await client.query({
    text: deletePendingMembershipQuery,
    values: [args.id, args.email],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
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

export async function getWeeklyVisitsByEmail(
  client: Client,
  args: GetWeeklyVisitsByEmailArgs,
): Promise<GetWeeklyVisitsByEmailRow[]> {
  const result = await client.query({
    text: getWeeklyVisitsByEmailQuery,
    values: [args.email],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      weekNumber: row[0],
      weekCount: row[1],
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

export async function getMonthlyVisitsByEmail(
  client: Client,
  args: GetMonthlyVisitsByEmailArgs,
): Promise<GetMonthlyVisitsByEmailRow[]> {
  const result = await client.query({
    text: getMonthlyVisitsByEmailQuery,
    values: [args.email],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      monthNumber: row[0],
      monthCount: row[1],
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

export async function createMemberOrder(
  client: Client,
  args: CreateMemberOrderArgs,
): Promise<CreateMemberOrderRow | null> {
  const result = await client.query({
    text: createMemberOrderQuery,
    values: [
      args.email,
      args.nickname,
      args.dateOfBirth,
      args.phoneNumber,
      args.notes,
      args.additionalData,
      args.price,
    ],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    mainReferenceId: row[1],
    partId: row[2],
    notes: row[3],
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

export async function getOrderReferenceIdByEmail(
  client: Client,
  args: GetOrderReferenceIdByEmailArgs,
): Promise<GetOrderReferenceIdByEmailRow | null> {
  const result = await client.query({
    text: getOrderReferenceIdByEmailQuery,
    values: [args.email],
    rowMode: 'array',
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
    memberid: row[4],
  };
}

export const getOrderByReferenceIdQuery = `-- name: getOrderByReferenceId :one
SELECT id, member_id, price, reference_id, order_status, url, created_at, updated_at, notes, additional_info
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
}

export async function getOrderByReferenceId(
  client: Client,
  args: getOrderByReferenceIdArgs,
): Promise<getOrderByReferenceIdRow | null> {
  const result = await client.query({
    text: getOrderByReferenceIdQuery,
    values: [args.referenceId],
    rowMode: 'array',
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
  };
}

export const getWaitingPaymentOrdersQuery = `-- name: getWaitingPaymentOrders :many
SELECT o.id, o.price, o.reference_id, o.member_id, o.order_status, o.additional_info, m.email, m.nickname, m.additional_data
       FROM whygym.orders o 
       INNER JOIN whygym.members m ON m.id = o.member_id
       WHERE o.order_status = 'waiting payment method'
       LIMIT 100`;

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

export async function getWaitingPaymentOrders(
  client: Client,
): Promise<getWaitingPaymentOrdersRow[]> {
  const result = await client.query({
    text: getWaitingPaymentOrdersQuery,
    values: [],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      id: row[0],
      price: row[1],
      referenceId: row[2],
      memberId: row[3],
      orderStatus: row[4],
      additionalInfo: row[5],
      email: row[6],
      nickname: row[7],
      additionalData: row[8],
    };
  });
}

export const turnOnCashback100Query = `-- name: turnOnCashback100 :one
UPDATE whygym.orders
SET additional_info = jsonb_set(jsonb_set(additional_info, '{cashback200}', 'false'), '{cashback100}', 'true'), updated_at = current_timestamp
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

export async function turnOnCashback100(
  client: Client,
  args: turnOnCashback100Args,
): Promise<turnOnCashback100Row | null> {
  const result = await client.query({
    text: turnOnCashback100Query,
    values: [args.referenceId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    additionalInfo: row[1],
    referenceId: row[2],
  };
}

export const turnOffCashback100Query = `-- name: turnOffCashback100 :one
UPDATE whygym.orders
SET additional_info = jsonb_set(additional_info, '{cashback100}', 'false'), updated_at = current_timestamp
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

export async function turnOffCashback100(
  client: Client,
  args: turnOffCashback100Args,
): Promise<turnOffCashback100Row | null> {
  const result = await client.query({
    text: turnOffCashback100Query,
    values: [args.referenceId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    additionalInfo: row[1],
    referenceId: row[2],
  };
}

export const turnOnCashback200Query = `-- name: turnOnCashback200 :one
UPDATE whygym.orders
SET additional_info = jsonb_set(jsonb_set(additional_info, '{cashback100}', 'false'), '{cashback200}', 'true'), updated_at = current_timestamp
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

export async function turnOnCashback200(
  client: Client,
  args: turnOnCashback200Args,
): Promise<turnOnCashback200Row | null> {
  const result = await client.query({
    text: turnOnCashback200Query,
    values: [args.referenceId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    additionalInfo: row[1],
    referenceId: row[2],
  };
}

export const turnOffCashback200Query = `-- name: turnOffCashback200 :one
UPDATE whygym.orders
SET additional_info = jsonb_set(additional_info, '{cashback200}', 'false'), updated_at = current_timestamp
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

export async function turnOffCashback200(
  client: Client,
  args: turnOffCashback200Args,
): Promise<turnOffCashback200Row | null> {
  const result = await client.query({
    text: turnOffCashback200Query,
    values: [args.referenceId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    additionalInfo: row[1],
    referenceId: row[2],
  };
}

export const turnOnExtend30Query = `-- name: turnOnExtend30 :one
UPDATE whygym.orders
SET additional_info = jsonb_set(jsonb_set(additional_info, '{extend90}', 'false'), '{extend30}', 'true'), updated_at = current_timestamp
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

export async function turnOnExtend30(
  client: Client,
  args: turnOnExtend30Args,
): Promise<turnOnExtend30Row | null> {
  const result = await client.query({
    text: turnOnExtend30Query,
    values: [args.referenceId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    additionalInfo: row[1],
    referenceId: row[2],
  };
}

export const turnOffExtend30Query = `-- name: turnOffExtend30 :one
UPDATE whygym.orders
SET additional_info = jsonb_set(additional_info, '{extend30}', 'false'), updated_at = current_timestamp
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

export async function turnOffExtend30(
  client: Client,
  args: turnOffExtend30Args,
): Promise<turnOffExtend30Row | null> {
  const result = await client.query({
    text: turnOffExtend30Query,
    values: [args.referenceId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    additionalInfo: row[1],
    referenceId: row[2],
  };
}

export const turnOnExtend90Query = `-- name: turnOnExtend90 :one
UPDATE whygym.orders
SET additional_info = jsonb_set(jsonb_set(additional_info, '{extend30}', 'false'), '{extend90}', 'true'), updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOnExtend90Args {
  referenceId: string;
}

export interface turnOnExtend90Row {
  id: number;
  additionalInfo: any | null;
  referenceId: string;
}

export async function turnOnExtend90(
  client: Client,
  args: turnOnExtend90Args,
): Promise<turnOnExtend90Row | null> {
  const result = await client.query({
    text: turnOnExtend90Query,
    values: [args.referenceId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    additionalInfo: row[1],
    referenceId: row[2],
  };
}

export const turnOffExtend90Query = `-- name: turnOffExtend90 :one
UPDATE whygym.orders
SET additional_info = jsonb_set(additional_info, '{extend90}', 'false'), updated_at = current_timestamp
WHERE reference_id = $1
RETURNING id, additional_info, reference_id`;

export interface turnOffExtend90Args {
  referenceId: string;
}

export interface turnOffExtend90Row {
  id: number;
  additionalInfo: any | null;
  referenceId: string;
}

export async function turnOffExtend90(
  client: Client,
  args: turnOffExtend90Args,
): Promise<turnOffExtend90Row | null> {
  const result = await client.query({
    text: turnOffExtend90Query,
    values: [args.referenceId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    additionalInfo: row[1],
    referenceId: row[2],
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

export async function insertOrderStatusLog(
  client: Client,
  args: insertOrderStatusLogArgs,
): Promise<insertOrderStatusLogRow | null> {
  const result = await client.query({
    text: insertOrderStatusLogQuery,
    values: [
      args.referenceId,
      args.orderStatus,
      args.notes,
      args.additionalInfo,
    ],
    rowMode: 'array',
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
    additionalInfo: row[4],
  };
}

export const getOrderAndMemberByReferenceIdQuery = `-- name: getOrderAndMemberByReferenceId :one
SELECT o.id, o.member_id, o.price, o.reference_id, o.order_status, o.url, o.created_at, o.updated_at, o.notes, o.additional_info, m.email, m.nickname, m.additional_data, m.phone_number
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

export async function getOrderAndMemberByReferenceId(
  client: Client,
  args: getOrderAndMemberByReferenceIdArgs,
): Promise<getOrderAndMemberByReferenceIdRow | null> {
  const result = await client.query({
    text: getOrderAndMemberByReferenceIdQuery,
    values: [args.referenceId],
    rowMode: 'array',
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
    phoneNumber: row[13],
  };
}

export const setOrderInvoiceResponseQuery = `-- name: setOrderInvoiceResponse :one
WITH data AS (
    SELECT $1::text AS content, $2::text as ref_id
)
UPDATE whygym.orders
SET additional_info = jsonb_set(coalesce(additional_info, '{}'), '{invoice_response}', data.content::jsonb), order_status = 'waiting invoice status', updated_at = current_timestamp
FROM data
WHERE reference_id = data.ref_id
RETURNING id, additional_info, reference_id`;

export interface setOrderInvoiceResponseArgs {
  content: string;
  refId: string;
}

export interface setOrderInvoiceResponseRow {
  id: number;
  additionalInfo: any | null;
  referenceId: string;
}

export async function setOrderInvoiceResponse(
  client: Client,
  args: setOrderInvoiceResponseArgs,
): Promise<setOrderInvoiceResponseRow | null> {
  const result = await client.query({
    text: setOrderInvoiceResponseQuery,
    values: [args.content, args.refId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    additionalInfo: row[1],
    referenceId: row[2],
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

export async function getUserRoles(
  client: Client,
  args: getUserRolesArgs,
): Promise<getUserRolesRow[]> {
  const result = await client.query({
    text: getUserRolesQuery,
    values: [args.userId],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      roles: row[0],
    };
  });
}

export const setInvoiceStatusResponseAndActivateMembershipQuery = `-- name: setInvoiceStatusResponseAndActivateMembership :one
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
    RETURNING m.id`;

export interface setInvoiceStatusResponseAndActivateMembershipArgs {
  mainReferenceId: string;
  invoiceStatusResponse: any;
}

export interface setInvoiceStatusResponseAndActivateMembershipRow {
  id: number;
}

export async function setInvoiceStatusResponseAndActivateMembership(
  client: Client,
  args: setInvoiceStatusResponseAndActivateMembershipArgs,
): Promise<setInvoiceStatusResponseAndActivateMembershipRow | null> {
  const result = await client.query({
    text: setInvoiceStatusResponseAndActivateMembershipQuery,
    values: [args.mainReferenceId, args.invoiceStatusResponse],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
  };
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

export async function getPaymentUrlByReferenceId(
  client: Client,
  args: getPaymentUrlByReferenceIdArgs,
): Promise<getPaymentUrlByReferenceIdRow | null> {
  const result = await client.query({
    text: getPaymentUrlByReferenceIdQuery,
    values: [args.referenceId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    paymenturl: row[0],
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

export async function getPotentialGroupData(
  client: Client,
  args: getPotentialGroupDataArgs,
): Promise<getPotentialGroupDataRow[]> {
  const result = await client.query({
    text: getPotentialGroupDataQuery,
    values: [args.email],
    rowMode: 'array',
  });
  return result.rows.map((row) => {
    return {
      id: row[0],
      email: row[1],
      nickname: row[2],
      gender: row[3],
      duration: row[4],
      checked: row[5],
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

export async function joinToGroup(
  client: Client,
  args: joinToGroupArgs,
): Promise<joinToGroupRow | null> {
  const result = await client.query({
    text: joinToGroupQuery,
    values: [args.mainReferenceId, args.partId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    mainReferenceId: row[1],
    partId: row[2],
    partReferenceId: row[3],
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

export async function removeFromGroup(
  client: Client,
  args: removeFromGroupArgs,
): Promise<removeFromGroupRow | null> {
  const result = await client.query({
    text: removeFromGroupQuery,
    values: [args.partId],
    rowMode: 'array',
  });
  if (result.rows.length !== 1) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row[0],
    mainReferenceId: row[1],
    partId: row[2],
    partReferenceId: row[3],
  };
}
