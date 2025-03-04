import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { User } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Get('profile')
  getProfile(@Request() req: { user: User }) {
    return req.user;
  }

  @Public()
  @Get('find-all')
  findAll() {
    return [];
  }

  @Get('find-all-admin')
  @Roles(Role.Admin)
  findAllAdmin() {
    return [];
  }
}
