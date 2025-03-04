import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OtpAuthService {
  private readonly authApiUrl: string;
  private readonly apiKey: string;
  private usersService: UsersService;

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
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
        this.httpService.post(
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
          deviceId: response.data.data.deviceId, // Return deviceId
          preAuthSessionId: response.data.data.preAuthSessionId, // Return preAuthSessionId
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to send OTP',
        };
      }
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data?.message || 'Failed to send OTP',
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyOtp(
    deviceId: string,
    preAuthSessionId: string,
    userInputCode: string,
  ): Promise<{ access_token: string }> {
    try {
      const request = {
        deviceId: deviceId,
        preAuthSessionId: preAuthSessionId,
        userInputCode: userInputCode,
        expiresIn: 60,
      };
      console.log('request');
      console.log(request);
      const response = await firstValueFrom(
        this.httpService.post(`${this.authApiUrl}/v1/auth/otp/verify`, request,{
          headers: {
              'x-api-key': this.apiKey, // Add the x-api-key header here
            },
          },
        ),
      );

      console.log('response');
      console.log(response);

      if (response.data.status) {
        // Assuming the external API returns user data upon successful verification
        
        if(response.data.user){
          console.log('user');
          console.log(response.data);
        }

        // Create a JWT token with user information
        const payload = {
          apiId: "pikirin nanti",
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          email: response.data.data.user.email,
          roles: [],
        };

        return {
          access_token: await this.jwtService.signAsync(payload),
        };
      } else {
        throw new HttpException(
          response.data.message || 'Failed to send OTP',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Invalid OTP',
        error.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
