import { Controller, Get, Render, Post, Param, Query, Body, Request } from '@nestjs/common';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { FoService } from './fo.service';
import Sqids from 'sqids';
import { MembersService } from 'src/members/members.service';
import { User } from 'src/users/users.service';
import { Public } from 'src/auth/decorators/public.decorator';

interface AdditionalData {
  picUrl: string | undefined;
}

@Controller('fo')
export class FoController {
  constructor(
    private readonly foService: FoService,
    private readonly membersService: MembersService,
  ) {}

  @Get("/")
  index() {
    return '<script>window.location.href="https://whygym.id"</script>';
  }
}
