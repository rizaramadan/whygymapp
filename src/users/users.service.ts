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
import { HttpError, JwtPayload } from 'src/auth/auth.interfaces';
import type { Multer } from 'multer';
import { JwtService } from '@nestjs/jwt';
import { UserMeResponse } from './interfaces/user-response.interface';

export type User = {
  id: number;
  apiId: string;
  email: string;
  username: string;
  password: string;
  roles: string[];
  fullName: string;
  picUrl: string;
  accessToken: string;
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
  accessToken: '',
};

@Injectable()
export class UsersService {
  private readonly authApiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly jwtService: JwtService,
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
            accessToken: '',
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
        accessToken: '',
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
    user: User,
    args: { file: Multer.File; userId: string; gender: string },
  ): Promise<{ accessToken: string; picUrl: string; error: ErrorApp }> {
    // Skip if error exists from previous step
    if (error.hasError()) {
      return { accessToken: '', picUrl: '', error };
    }

    try {
      // Upload image first
      const formData = new FormData();
      const blob = new Blob([args.file.buffer], { type: args.file.mimetype });
      formData.append('avatar', blob, args.file.originalname);
      formData.append('fullName', 'some fullname');
      formData.append('gender', args.gender);
      formData.append('phoneNumber', '+628000000000');
      formData.append('birthDate', '2000-01-01T10:10:10.111Z');
      formData.append('province', 'Jawa Barat');
      formData.append('city', 'Bogor');

      const response = await firstValueFrom(
        this.httpService.post<{
          status: number;
          message: string;
          data: {
            url: string;
          };
        }>(`${this.authApiUrl}/v1/users/create-profile`, formData, {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.accessToken}`,
          },
        }),
      );

      console.log('response create-profile', response);

      if (!response.data.status) {
        console.log(response.data);
        return {
          accessToken: '',
          picUrl: '',
          error: new ErrorApp(
            'Failed to upload image',
            'user-service-pic-201',
            response.data,
          ),
        };
      }

      const responseOfMe = await firstValueFrom(
        this.httpService.get<UserMeResponse>(`${this.authApiUrl}/v1/users/me`, {
          headers: {
            'x-api-key': this.apiKey,
            Authorization: `Bearer ${user.accessToken}`,
          },
        }),
      );

      console.log('response of me', responseOfMe);

      if (!response.data.status) {
        console.log(response.data);
        return {
          accessToken: '',
          picUrl: '',
          error: new ErrorApp(
            'Failed to get /users/me of darisini.com',
            'user-service-pic-201',
            response.data,
          ),
        };
      }

      const payload: JwtPayload = {
        id: '',
        apiId: user.apiId || '',
        accessToken: user.accessToken || '',
        refreshToken: '',
        email: user.email || '',
        roles: user.roles || [],
        fullName: user.fullName || '',
        picUrl: responseOfMe.data.data.user.picture?.url || '',
        needSignUp: false,
      };
      const access_token = await this.jwtService.signAsync(payload);

      return {
        accessToken: access_token,
        picUrl: response.data.data.url,
        error: ErrorApp.success,
      };
    } catch (error) {
      console.log(error);
      const httpError = error as HttpError;
      return {
        accessToken: '',
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
