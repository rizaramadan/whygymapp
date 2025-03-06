import { Controller, Get, Post, Body, Render } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/roles/decorators/roles.decorator';
import {
  CreateUserRequestArgs,
  GetPendingUserRequestsRow,
  ApproveUserRequestArgs,
  CreateUserRequestRow,
} from '../../db/src/query_sql';

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
  ): Promise<CreateUserRequestRow | null> {
    return this.usersService.createUserRequest(body);
  }

  // view all user requests for front officer
  @Get('user-requests')
  @Roles('front-officer')
  @Render('users/user-requests')
  async getUserRequests() {
    const userRequests = await this.usersService.getUserRequests();
    console.log(userRequests);
    return { userRequests };
  }

  // approve user request for admin
  @Post('approve-user-request')
  @Roles('admin')
  async approveUserRequest(@Body() body: ApproveUserRequestArgs) {
    return this.usersService.approveUserRequest(body);
  }

  // view pending user requests for admin
  @Get('pending-user-requests')
  @Roles('admin')
  @Render('users/pending-user-requests')
  async getPendingUserRequests(): Promise<GetPendingUserRequestsRow[] | null> {
    return this.usersService.getPendingUserRequests();
  }
}
