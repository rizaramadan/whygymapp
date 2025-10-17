import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Request,
  Param,
  Response,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import {
  CreateUserRequestArgs,
  CreateUserRequestRow,
  ApproveAndApplyUserArgs,
  RejectUserRequestArgs,
} from '../../db/src/query_sql';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { User, UsersService } from './users.service';
import { ErrorApp } from 'src/common/result';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("/")
  index() {
    return '<script>window.location.href="https://whygym.id"</script>';
  }
}
