import { Controller, Post, Body } from '@nestjs/common';
import { OtpAuthService } from './otp-auth.service';
import { ErrorApp } from 'src/common/result';

class CreateOtpDto {
  email: string;
}

class VerifyOtpDto {
  deviceId: string;
  preAuthSessionId: string;
  userInputCode: string;
}

@Controller('auth/otp')
export class OtpAuthController {
  constructor(private readonly otpAuthService: OtpAuthService) {}

  @Post('create')
  async createOtp(@Body() createOtpDto: CreateOtpDto) {
    const error = ErrorApp.success;
    return this.otpAuthService.createOtp(error, createOtpDto.email);
  }

  @Post('verify')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const error = ErrorApp.success;
    return this.otpAuthService.verifyOtp(error, verifyOtpDto);
  }
}
