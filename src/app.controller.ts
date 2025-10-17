import {
  Controller,
  Get,
  Render,
  Request,
  Res,
  Param,
  Sse,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { User, UsersService } from './users/users.service';
import { Roles } from './roles/decorators/roles.decorator';
import { MembersService } from './members/members.service';
import { Response } from 'express';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Sqids from 'sqids';
import { Public } from './auth/decorators/public.decorator';

interface ToggleWeekendOnlyDto {
  enabled: boolean;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly membersService: MembersService,
    private readonly usersService: UsersService,
  ) {}

  @Get('/health')
  @Public()
  health() {
    return { status: 'ok' };
  }

  @Get('/')
  getHello() {
    return '<script>window.location.href="https://whygym.id"</script>';
  }


  @Get('/pretest')
  @Public()
  @Render('pretest')
  getPretest() {
    return {};
  }
}
