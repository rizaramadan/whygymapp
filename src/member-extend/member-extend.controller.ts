import { Controller, Get, Post, Render, Request, Body, Param, Query, Redirect, HttpException, HttpStatus } from '@nestjs/common';
import { MemberData, MemberExtendService } from './member-extend.service';
import { MembersService } from '../members/members.service';
import { User } from '../users/users.service';
import { Response } from 'express';
import { PaymentInput, PaymentResponse } from './member-extend.interfaces';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('member-extend')
export class MemberExtendController {
  constructor(
    private readonly memberExtendService: MemberExtendService,
    private readonly membersService: MembersService,
  ) {}

  @Get("/")
  test() {
    return '<script>window.location.href="https://whygym.id"</script>';
  }
}
