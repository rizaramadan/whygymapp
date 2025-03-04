import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OtpAuthService {
  private readonly authApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.authApiUrl = process.env.AUTH_API_URL || 'https://authapi.com';
  }

  async createOtp(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authApiUrl}/v1/auth/otp/create`, {
          email,
        }),
      );

      return {
        success: true,
        message: 'OTP has been sent to your email',
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to send OTP',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ access_token: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authApiUrl}/v1/auth/otp/verify`, {
          email,
          otp,
        }),
      );

      // Assuming the external API returns user data upon successful verification
      const userData = response.data;

      // Create a JWT token with user information
      const payload = {
        sub: userData.id || email,
        email: email,
        roles: userData.roles || ['user'],
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Invalid OTP',
        error.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
