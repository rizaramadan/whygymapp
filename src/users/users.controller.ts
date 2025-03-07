import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Request,
  Param,
  Response,
  Res,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import {
  CreateUserRequestArgs,
  CreateUserRequestRow,
  ApproveAndApplyUserArgs,
} from '../../db/src/query_sql';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { User, UsersService } from './users.service';

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
  async createUserRequest(
    @Body() body: CreateUserRequestArgs,
    @Response() res: ExpressResponse,
  ): Promise<CreateUserRequestRow | null> {
    const result = await this.usersService.createUserRequest(body);
    res.setHeader('HX-Redirect', '/users/user-requests');
    return result;
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

  // view pending user requests for admin
  @Get('pending-user-requests')
  @Roles('admin')
  @Render('users/pending-user-requests')
  async getPendingUserRequests() {
    const pendings = await this.usersService.getPendingUserRequests();
    console.log(pendings);
    return { pendings };
  }
}
