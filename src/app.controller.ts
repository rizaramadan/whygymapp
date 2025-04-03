import {
  Controller,
  Get,
  Render,
  Request,
  Res,
  Param,
  Sse,
} from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './users/users.service';
import { Roles } from './roles/decorators/roles.decorator';
import { MembersService } from './members/members.service';
import { Response } from 'express';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly membersService: MembersService,
  ) {}

  @Get()
  @Render('index')
  getHello() {
    return {
      message: this.appService.getHello(),
    };
  }

  @Get('/user-dashboard')
  @Render('user-dashboard')
  async dashboard(@Request() req: { user: User }) {
    // Mock data for membership applications
    const membershipApplication =
      await this.membersService.getOrderReferenceIdByEmail(req.user.email);
    const activeMembership =
      await this.membersService.getActiveMembershipByEmail(req.user.email);
    return {
      user: req.user,
      membershipApplication: membershipApplication,
      activeMembership: activeMembership,
    };
  }

  @Get('/member-dashboard')
  @Render('member-dashboard')
  async memberDashboard(@Request() req: { user: User }) { 
    const memberActiveDate = await this.membersService.getMemberActiveDate(
      req.user.email,
    );
    return {
      user: req.user,
      memberActiveDate,
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
    return {
      result,
      theAccessToken: req.user.accessToken,
    };
  }

  @Get('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('access_token', null);
    return '<script>window.location.href = "/auth/login";</script>';
  }

  @Get('/payment/:referenceId/success')
  success(@Param('referenceId') referenceId: string) {
    return `oke ${referenceId}`;
  }

  @Get('/debug-sentry')
  getError() {
    throw new Error('My first Sentry error!');
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return interval(1000).pipe(
      map((_) => ({ data: { hello: 'world' } }) as MessageEvent),
    );
  }
}
