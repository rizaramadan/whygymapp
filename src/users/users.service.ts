import { Inject, Injectable } from '@nestjs/common';
import {
  createUserRequest,
  getUserRequests,
  getPendingUserRequests,
  GetUserRequestsRow,
  GetPendingUserRequestsRow,
  approveAndApplyUser,
  ApproveAndApplyUserArgs,
  ApproveAndApplyUserRow,
  checkUserCredentials,
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
import { ErrorApp } from 'src/common/result';

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

export const NullUser: User = {
  id: 0,
  apiId: '',
  email: '',
  username: '',
  password: '',
  roles: [],
  fullName: '',
  picUrl: '',
};

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findOneWithEmail(
    error: ErrorApp,
    email: string,
  ): Promise<{ user: User; error: ErrorApp }> {
    //skip if error exist from previous step
    if (error.hasError()) {
      return { user: NullUser, error };
    }
    try {
      const userInDb = await getUserByEmail(this.pool, { email });

      if (userInDb) {
        return {
          user: {
            id: userInDb.id,
            apiId: '',
            email: '',
            username: userInDb.username,
            password: userInDb.password,
            // Trim spaces from each role after splitting
            roles: userInDb.roles?.split(',').map((role) => role.trim()) || [], // Assuming roles are stored as strings in the database
            fullName: '',
            picUrl: '',
          },
          error: ErrorApp.success,
        };
      }
      return {
        user: NullUser,
        error: ErrorApp.success, //its okay if user not found, because it a darisini.com user
      };
    } catch (error) {
      return {
        user: NullUser,
        error: new ErrorApp(
          'error findOneWithEmail',
          'user-service-082',
          error,
        ),
      };
    }
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

  async rejectUserRequest(
    args: RejectUserRequestArgs,
  ): Promise<RejectUserRequestRow | null> {
    return await rejectUserRequest(this.pool, args);
  }
}
