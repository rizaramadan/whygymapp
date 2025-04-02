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

  // create user request modal for front officer
  @Get('create-user-request-modal')
  @Roles('front-officer')
  @Render('users/create-user-request-modal')
  createUserRequestModal() {
    return {};
  }

  // create user request for front officer
  @Post('create-user-request')
  @Roles('front-officer')
  async createUserRequest(@Body() body: CreateUserRequestArgs) {
    await this.usersService.createUserRequest(body);
    return '<script>window.location.href="/users/user-requests"</script>';
  }

  // view all user requests for front officer
  @Get('user-requests')
  @Roles('front-officer')
  @Render('users/user-requests')
  async getUserRequests() {
    const userRequests = await this.usersService.getUserRequests();
    return { userRequests };
  }

  // approve user request for admin
  @Post('approve-user-request/:id')
  @Roles('admin')
  async approveUserRequest(
    @Request() req: { user: User },
    @Param('id') id: string,
  ) {
    const args: ApproveAndApplyUserArgs = {
      approvedBy: req.user.id,
      id: parseInt(id),
    };
    await this.usersService.approveAndApplyUser(args);
    return '<script>window.location.href="/users/pending-user-requests"</script>';
  }

  @Post('reject-user-request/:id')
  @Roles('admin')
  async rejectUserRequest(
    @Request() req: { user: User },
    @Param('id') id: string,
  ) {
    const args: RejectUserRequestArgs = {
      approvedBy: req.user.id,
      id: parseInt(id),
    };
    await this.usersService.rejectUserRequest(args);
    return '<script>window.location.href="/users/pending-user-requests"</script>';
  }

  // view pending user requests for admin
  @Get('pending-user-requests')
  @Roles('admin')
  @Render('users/pending-user-requests')
  async getPendingUserRequests() {
    const pendings = await this.usersService.getPendingUserRequests();
    console.log(pendings);
    return { pendings };
  }

  // Upload picture page
  @Get('upload-picture')
  @Render('users/upload-picture')
  getUploadPicturePage(@Request() req: { user: User }) {
    // If user already has a picture URL, redirect to dashboard
    if (req.user.picUrl) {
      return '<script>window.location.href="/user-dashboard"</script>';
    }

    return {};
  }

  // Save picture URL endpoint
  @Post('save-picture')
  @UseInterceptors(FileInterceptor('file'))
  async savePicture(
    @Request() req: { user: User },
    @UploadedFile() file: Multer.File,
    @Body('gender') gender: string,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { accessToken, picUrl, error } =
      await this.usersService.addOrUpdateUserPicture(
        ErrorApp.success,
        req.user,
        {
          userId: req.user.id.toString(),
          file,
          gender,
        },
      );

    res.cookie('access_token', accessToken);

    if (error.hasError()) {
      throw new Error(error.code + ' ' + error.message);
    }

    return { success: true, picUrl };
  }
}
