import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './auth.interfaces';

interface OtpCreateResponse {
  status: boolean;
  message: string;
  data?: {
    deviceId?: string;
    preAuthSessionId?: string;
    user?: {
      id: string;
      email: string;
      // Add other user properties as needed
    };
    accessToken?: string;
    refreshToken?: string;
  };
}

interface OtpVerifyResponse {
  status: number; // Changed to number to match the example
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      signup: boolean;
      id: string;
      email: string;
      roles: string[]; // Assuming roles is an array of strings
      fullName: string;
    };
  };
}

interface HttpError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

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

  async createOtp(email: string): Promise<{
    success: boolean;
    message: string;
    deviceId?: string;
    preAuthSessionId?: string;
  }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<OtpCreateResponse>(
          `${this.authApiUrl}/v1/auth/otp/create`,
          {
            email,
          },
          {
            headers: {
              'x-api-key': this.apiKey, // Add the x-api-key header here
            },
          },
        ),
      );

      // Check if the response indicates success
      if (response.data.status) {
        return {
          success: true,
          message: 'OTP has been sent to your email',
          deviceId: response.data.data?.deviceId || '', // Return deviceId
          preAuthSessionId: response.data.data?.preAuthSessionId || '', // Return preAuthSessionId
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to send OTP',
        };
      }
    } catch (error) {
      const httpError = error as HttpError; // Cast to HttpError
      throw new HttpException(
        httpError.response?.data?.message || 'Failed to send OTP',
        httpError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyOtp(verifyOtpDto: {
    deviceId: string;
    preAuthSessionId: string;
    userInputCode: string;
  }): Promise<{ roles: string[]; fullName: string; access_token: string }> {
    try {
      const request = {
        deviceId: verifyOtpDto.deviceId,
        preAuthSessionId: verifyOtpDto.preAuthSessionId,
        userInputCode: verifyOtpDto.userInputCode,
        expiresIn: 60,
      };

      const response = await firstValueFrom(
        this.httpService.post<OtpVerifyResponse>(
          `${this.authApiUrl}/v1/auth/otp/verify`,
          request,
          {
            headers: {
              'x-api-key': this.apiKey, // Add the x-api-key header here
            },
          },
        ),
      );

      if (response.data.status) {
        // Assuming the external API returns user data upon successful verification
        const userInDb = await this.usersService.findOneWithEmail(
          response.data.data?.user?.email || '',
        );

        console.log('userInDb', userInDb);
        console.log('verifyOtp user roles', userInDb?.roles);

        // Create a JWT token with user information
        const payload: JwtPayload = {
          id: userInDb?.id.toString() || '',
          apiId: response.data.data?.user?.id || '',
          accessToken: response.data.data?.accessToken || '',
          refreshToken: response.data.data?.refreshToken || '',
          email: response.data.data?.user?.email || '',
          //userInDb?.roles is string "[ 'admin', 'user' ]",
          roles: userInDb?.roles || [],
          fullName: response.data.data?.user?.fullName || '',
        };

        return {
          roles: payload.roles,
          fullName: payload.fullName,
          access_token: await this.jwtService.signAsync(payload),
        };
      } else {
        throw new HttpException(
          response.data.message || 'Failed to send OTP',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error) {
      const httpError = error as HttpError; // Cast to HttpError
      throw new HttpException(
        httpError.response?.data?.message || 'Invalid OTP',
        httpError.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
