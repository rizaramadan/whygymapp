import { Inject, Injectable } from '@nestjs/common';
import {
  createUserRequest,
  getUserRequests,
  approveUserRequest,
  getPendingUserRequests,
  GetUserRequestsRow,
  GetPendingUserRequestsRow,
  approveAndApplyUser,
  ApproveAndApplyUserArgs,
  ApproveAndApplyUserRow,
  checkUserCredentials,
  ApproveUserRequestArgs,
  ApproveUserRequestRow,
  CreateUserRequestArgs,
  CreateUserRequestRow,
  getUserByEmail,
  CheckUserCredentialsArgs,
  getUserByUsername,
  RejectUserRequestRow,
  RejectUserRequestArgs,
  rejectUserRequest,
} from '../../db/src/query_sql'; // Import the functions from the query_sql file
import { Pool } from 'pg';

export type User = {
  id: number;
  apiId: string;
  email: string;
  username: string;
  password: string;
  roles: string[];
  fullName: string;
  picUrl: string;
};

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findOneWithEmail(email: string): Promise<User | undefined> {
    const userInDb = await getUserByEmail(this.pool, { email });

    if (userInDb) {
      return {
        id: userInDb.id,
        apiId: '',
        email: '',
        username: userInDb.username,
        password: userInDb.password,
        // Trim spaces from each role after splitting
        roles: userInDb.roles.split(',').map((role) => role.trim()), // Assuming roles are stored as strings in the database
        fullName: '',
        picUrl: '',
      };
    }
    return undefined;
  }

  async findOneWithUsername(username: string): Promise<User | undefined> {
    const userInDb = await getUserByUsername(this.pool, { username });

    if (userInDb) {
      return {
        id: userInDb.id,
        apiId: '',
        email: '',
        username: userInDb.username,
        password: userInDb.password,
        // Trim spaces from each role after splitting
        roles: userInDb.roles?.split(',').map((role) => role.trim()) || [], // Assuming roles are stored as strings in the database
        fullName: '',
        picUrl: '',
      };
    }
    return undefined;
  }

  async createUserRequest(
    body: CreateUserRequestArgs,
  ): Promise<CreateUserRequestRow | null> {
    return await createUserRequest(this.pool, body);
  }

  async getUserRequests(): Promise<GetUserRequestsRow[] | null> {
    const data = await getUserRequests(this.pool);
    return data;
  }

  async getPendingUserRequests(): Promise<GetPendingUserRequestsRow[] | null> {
    return await getPendingUserRequests(this.pool);
  }

  async approveAndApplyUser(
    body: ApproveAndApplyUserArgs,
  ): Promise<ApproveAndApplyUserRow | null> {
    return await approveAndApplyUser(this.pool, body);
  }


  async checkUserCredentials(
    username: string,
    password: string,
  ): Promise<boolean> {
    const param: CheckUserCredentialsArgs = {
      username,
      crypt: password,
    };
    const result = await checkUserCredentials(this.pool, param);
    return result?.count === '1';
  }

  async rejectUserRequest(args: RejectUserRequestArgs): Promise<RejectUserRequestRow | null> {
    return await rejectUserRequest(this.pool, args);
  }
}
