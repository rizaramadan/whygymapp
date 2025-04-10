import { Injectable, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { async, firstValueFrom } from 'rxjs';
import { UsersService, User } from 'src/users/users.service';
import {
  JwtPayload,
  OtpCreateResponse,
  OtpVerifyApiResponse,
  HttpError,
  NullPayload,
} from './auth.interfaces';
import { ErrorApp } from 'src/common/result';

@Injectable()
export class OtpAuthService {
  private readonly authApiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    this.authApiUrl = process.env.AUTH_API_URL || 'https://authapi.com';
    this.apiKey = process.env.API_KEY || '1234567890';
  }

  // create otp, first created to be called by AuthController.createOtp
  async createOtp(
    error: ErrorApp,
    email: string,
    action?: string,
    returnUrl?: string,
  ): Promise<{
    success: boolean;
    message: string;
    deviceId?: string;
    preAuthSessionId?: string;
    error?: ErrorApp;
    returnUrl?: string;
  }> {
    //skip if error exist from previous step
    if (error.hasError()) {
      return { success: false, message: '', error };
    }
    // call api create send otp
    const { response, error: errorOtp } = await this.callApiCreateSendOtp(
      error,
      email,
    );
    // return constructed response
    return this.constructCreateOtpResponse(errorOtp, response, action, returnUrl);
  }

  // call api create send otp, first created to be called by  createOtp
  private async callApiCreateSendOtp(
    error: ErrorApp,
    email: string,
  ): Promise<{
    response: OtpCreateResponse | null;
    error: ErrorApp;
  }> {
    //skip if error exist from previous step
    if (error.hasError()) {
      return { response: null, error };
    }
    try {
      // call api to send otp
      const response = await firstValueFrom(
        this.httpService.post<OtpCreateResponse>(
          `${this.authApiUrl}/v1/auth/otp/create`,
          {
            email,
          },
          {
            headers: {
              'x-api-key': this.apiKey,
            },
          },
        ),
      );
      // return response
      return { response: response.data, error: ErrorApp.success };
    } catch (error) {
      // handle error
      const httpError = error as HttpError;
      const data = {
        message: httpError.response?.data?.message || 'Failed to send OTP',
        status: httpError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
      return {
        response: null,
        error: new ErrorApp(
          'error call api create send otp',
          'otp-auth-092',
          data,
        ),
      };
    }
  }

  // construct response for createOtp, first created to be called by createOtp
  private constructCreateOtpResponse(
    error: ErrorApp,
    response: OtpCreateResponse | null,
    action?: string,
    returnUrl?: string,
  ): {
    success: boolean;
    message: string;
    deviceId?: string;
    preAuthSessionId?: string;
    action?: string;
    error?: ErrorApp;
    returnUrl?: string;
  } {
    //skip if error exist from previous step
    if (error.hasError()) {
      return { success: false, message: '', error };
    }
    if (response?.status) {
      // return response if success
      return {
        success: true,
        message: 'OTP has been sent to your email',
        deviceId: response.data?.deviceId || '',
        preAuthSessionId: response.data?.preAuthSessionId || '',
        action: action,
        returnUrl: returnUrl,
      };
    } else {
      // return response if failed
      return {
        success: false,
        message: '',
        error: new ErrorApp(
          'error call api create send otp',
          'otp-auth-133',
          response,
        ),
      };
    }
  }

  async verifyOtp(
    error: ErrorApp,
    verifyOtpDto: {
      deviceId: string;
      preAuthSessionId: string;
      userInputCode: string;
    },
  ): Promise<{
    roles: string[];
    fullName: string;
    access_token: string;
    error: ErrorApp;
  }> {
    //skip if error exist from previous step
    if (error.hasError()) {
      return { roles: [], fullName: '', access_token: '', error };
    }
    try {
      const { response, error: errorVerifyOtp } = await this.callApiVerifyOtp(
        error,
        verifyOtpDto,
      );

      console.log('response callApiVerifyOtp', response);

      // find user in db with email
      const findUserResult = await this.usersService.findOneWithEmail(
        errorVerifyOtp,
        response?.data?.user?.email || '',
      );

      // create jwt payload with user information
      const {
        payload,
        access_token,
        error: errorJwt,
      } = await this.createJwtPayloadWithUserInformation(
        findUserResult.error,
        findUserResult.user,
        response,
      );

      // return response
      return {
        roles: payload.roles,
        fullName: payload.fullName,
        access_token: access_token,
        error: errorJwt,
      };
    } catch (error) {
      const httpError = error as HttpError;
      return {
        roles: [],
        fullName: '',
        access_token: '',
        error: new ErrorApp('error verify otp', 'otp-auth-179', httpError),
      };
    }
  }

  public async createJwtPayloadWithUserInformation(
    error: ErrorApp,
    userInDb: User,
    response: OtpVerifyApiResponse | null,
  ): Promise<{ payload: JwtPayload; access_token: string; error: ErrorApp }> {
    if (error.hasError()) {
      return {
        payload: NullPayload,
        access_token: '',
        error,
      };
    }
    try {
      const payload: JwtPayload = {
        id: userInDb?.id.toString() || '',
        apiId: response?.data?.user?.id || '',
        accessToken: response?.data?.accessToken || '',
        refreshToken: response?.data?.refreshToken || '',
        email: response?.data?.user?.email || '',
        roles: userInDb?.roles || [],
        fullName: response?.data?.user?.fullName || '',
        picUrl: response?.data?.user?.picture?.url || '',
        needSignUp: response?.data?.user?.signup || false,
      };
      const access_token = await this.jwtService.signAsync(payload);
      return {
        payload,
        access_token,
        error: ErrorApp.success,
      };
    } catch (error) {
      return {
        payload: NullPayload,
        access_token: '',
        error: new ErrorApp('error create jwt payload', 'otp-auth-240', error),
      };
    }
  }

  private async callApiVerifyOtp(
    error: ErrorApp,
    verifyOtpDto: {
      deviceId: string;
      preAuthSessionId: string;
      userInputCode: string;
    },
  ): Promise<{
    response: OtpVerifyApiResponse | null;
    error: ErrorApp;
  }> {
    //skip if error exist from previous step
    if (error.hasError()) {
      return { response: null, error };
    }
    try {
      const request = {
        deviceId: verifyOtpDto.deviceId,
        preAuthSessionId: verifyOtpDto.preAuthSessionId,
        userInputCode: verifyOtpDto.userInputCode,
        expiresIn: 60,
      };

      const response = await firstValueFrom(
        this.httpService.post<OtpVerifyApiResponse>(
          `${this.authApiUrl}/v1/auth/otp/verify`,
          request,
          {
            headers: {
              'x-api-key': this.apiKey,
            },
          },
        ),
      );
      if (response.data.status && response.data.data?.accessToken) {
        return { response: response.data, error: ErrorApp.success };
      } else {
        return {
          response: null,
          error: new ErrorApp('otp not verified', 'otp-auth-274', response),
        };
      }
    } catch (error) {
      const httpError = error as HttpError;
      return {
        response: null,
        error: new ErrorApp(
          'error call api verify otp',
          'otp-auth-283',
          httpError,
        ),
      };
    }
  }
}
