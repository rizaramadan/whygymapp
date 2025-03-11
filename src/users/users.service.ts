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
  AddOrUpdateUserPictureArgs,
  addOrUpdateUserPicture,
  GetUserPictureArgs,
  GetUserPictureRow,
  getUserPicture,
  createAndGetUser,
} from '../../db/src/query_sql'; // Import the functions from the query_sql file
import { Pool } from 'pg';
import { ErrorApp } from 'src/common/result';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HttpStatus } from '@nestjs/common';
import { HttpError } from 'src/auth/auth.interfaces';
import type { Multer } from 'multer';

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
  private readonly authApiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject('DATABASE_POOL') private readonly pool: Pool,
  ) {
    this.authApiUrl = process.env.AUTH_API_URL || 'https://authapi.com';
    this.apiKey = process.env.API_KEY || '1234567890';
  }

  async findOneWithEmail(
    error: ErrorApp,
    email: string,
  ): Promise<{ user: User; error: ErrorApp }> {
    //skip if error exist from previous step
    if (error.hasError()) {
      return { user: NullUser, error };
    }
    try {
      let errorMsg = 'getUserByEmail';
      let userInDb = await getUserByEmail(this.pool, { email });

      if (!userInDb) {
        errorMsg = 'createAndGetUser';
        userInDb = await createAndGetUser(this.pool, {
          email,
          username: email,
          md5: Buffer.from(email),
        });
      }

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
        error: new ErrorApp(
          'error findOneWithEmail on ' + errorMsg,
          'user-service-107',
          null,
        ),
      };
    } catch (error) {
      return {
        user: NullUser,
        error: new ErrorApp(
          'error findOneWithEmail',
          'user-service-116',
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

  async getUserPicture(
    args: GetUserPictureArgs,
  ): Promise<GetUserPictureRow | null> {
    return await getUserPicture(this.pool, args);
  }

  async addOrUpdateUserPicture(
    error: ErrorApp,
    args: { file: Multer.File; userId: string },
  ): Promise<{ picUrl: string; error: ErrorApp }> {
    // Skip if error exists from previous step
    if (error.hasError()) {
      return { picUrl: '', error };
    }

    try {
      // Upload image first
      const formData = new FormData();
      const blob = new Blob([args.file.buffer], { type: args.file.mimetype });
      formData.append('file', blob, args.file.originalname);

      const response = await firstValueFrom(
        this.httpService.post<{
          status: number;
          message: string;
          data: {
            url: string;
          };
        }>(`${this.authApiUrl}/v1/images/upload`, formData, {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'multipart/form-data',
          },
        }),
      );

      if (!response.data.status) {
        console.log(response.data);
        return {
          picUrl: '',
          error: new ErrorApp(
            'Failed to upload image',
            'user-service-pic-201',
            response.data,
          ),
        };
      }

      // Save URL to database
      const result = await addOrUpdateUserPicture(this.pool, {
        userId: args.userId,
        value: response.data.data.url,
      });

      if (!result) {
        return {
          picUrl: '',
          error: new ErrorApp(
            'Failed to save image URL to database',
            'user-service-pic-218',
            null,
          ),
        };
      }

      return {
        picUrl: response.data.data.url,
        error: ErrorApp.success,
      };
    } catch (error) {
      console.log(error);
      const httpError = error as HttpError;
      return {
        picUrl: '',
        error: new ErrorApp(
          'Error processing image upload',
          'user-service-pic-234',
          {
            message: httpError.response?.data?.message || 'Upload failed',
            status:
              httpError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          },
        ),
      };
    }
  }
}
