import {
  IsString,
  IsEmail,
  IsOptional,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class MembershipApplicationDto {
  @IsEmail()
  @IsOptional()
  emailPic?: string;

  @IsString()
  duration: string;

  @IsString()
  fullName: string;

  @IsString()
  nickname: string;

  @IsString()
  gender: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  address: string;

  @IsString()
  wa: string;

  @IsString()
  identityNumber: string;

  @IsString()
  healthCondition: string;

  // Optional parent/guardian fields
  @IsString()
  @IsOptional()
  parentName?: string;

  @IsString()
  @IsOptional()
  parentIdentityNumber?: string;

  @IsString()
  @IsOptional()
  parentContact?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(
    ({ value }) => value === 'true' || value === true || value === 'on',
  )
  underageConsent?: boolean;

  // Agreement fields
  @IsBoolean()
  @Transform(
    ({ value }) => value === 'true' || value === true || value === 'on',
  )
  termsAgree: boolean;

  @IsBoolean()
  @Transform(
    ({ value }) => value === 'true' || value === true || value === 'on',
  )
  riskAgree: boolean;

  @IsBoolean()
  @Transform(
    ({ value }) => value === 'true' || value === true || value === 'on',
  )
  dataAgree: boolean;

  @IsBoolean()
  @Transform(
    ({ value }) => value === 'true' || value === true || value === 'on',
  )
  rulesAgree: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(
    ({ value }) => value === 'true' || value === true || value === 'on',
  )
  weekendOnly?: boolean;

  @IsString()
  frontOfficer: string;
}
export class EditMembershipApplicationDto {
  @IsEmail()
  emailPic: string;

  @IsString()
  duration: string;

  @IsString()
  gender: string;


}
