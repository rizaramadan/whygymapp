import { Controller, Get, Render, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './users/users.service';
import { Roles } from './roles/decorators/roles.decorator';
import { MembersService } from './members/members.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly membersService: MembersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/user-dashboard')
  @Render('user-dashboard')
  async dashboard(@Request() req: { user: User }) {
    // Mock data for membership applications
    const membershipApplication =
      await this.membersService.getPendingMembershipByEmail(req.user.email);
    console.log(membershipApplication);
    return {
      user: req.user,
      membershipApplication: membershipApplication,
    };
  }

  @Get('/member-dashboard')
  @Render('member-dashboard')
  @Roles('member')
  memberDashboard(@Request() req: { user: User }) {
    return {
      user: req.user,
    };
  }

  @Get('/admin-dashboard')
  @Render('admin-dashboard')
  @Roles('admin')
  adminDashboard(@Request() req: { user: User }) {
    return {
      user: req.user,
    };
  }

  @Get('/front-officer-dashboard')
  @Render('front-officer-dashboard')
  @Roles('front-officer')
  async frontOfficerDashboard() {
    const visitors = await this.membersService.getTodayVisitors();
    const lastVisitId = await this.membersService.getLastVisitId();
    return {
      visitors,
      lastVisitId: lastVisitId?.id,
    };
  }

  @Get('/me')
  me(@Request() req: { user: User }) {
    const result = req.user;
    result.id = 0;
    return result;
  }
}
