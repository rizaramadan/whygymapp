import { IsEmail, IsNotEmpty } from 'class-validator';
//this file somehow has linting errors, but its not a problem
export class CreateOtpDto {
  @IsEmail()
  email: string;
}
export class VerifyOtpDto {
  @IsNotEmpty()
  deviceId: string;
  @IsNotEmpty()
  preAuthSessionId: string;
  @IsNotEmpty()
  userInputCode: string;
  action?: string;
}
