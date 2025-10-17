import {
  Controller,
  Get,
  Request,
  Render,
  Query,
  Post,
  Body,
  Redirect,
  Param,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { User } from '../users/users.service';
import { MembersService } from './members.service';
import { Roles } from 'src/roles/decorators/roles.decorator';
import {
  EditMembershipApplicationDto,
  MembershipApplicationDto,
} from './dto/membership-application.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import Sqids from 'sqids';
import { PrivateCoachingService } from 'src/private-coaching/private-coaching.service';
import { AppService } from 'src/app.service';
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly appService: AppService,
  ) {}


  @Get("/")
  test() {
    return '<script>window.location.href="https://whygym.id"</script>';
  }

}
