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
  dashboard(@Request() req: { user: User }) {
    // Mock data for membership applications
    const mockApplications = [
      {
        id: '1',
        nickname: 'John',
        created_at: '2024-02-15T08:30:00Z',
        membership_status: 'PENDING',
        additionalData: {
          fullName: 'John Doe',
          duration: '90',
          emailPic: 'john@example.com',
        },
      },
      {
        id: '2',
        nickname: 'Jane',
        created_at: '2024-02-10T10:15:00Z',
        membership_status: 'PENDING',
        additionalData: {
          fullName: 'Jane Smith',
          duration: '180',
          emailPic: 'jane@example.com',
        },
      },
    ];

    return {
      user: req.user,
      membershipApplications: mockApplications,
      helpers: {
        eq: (v1: any, v2: any) => v1 === v2,
        formatDate: (date: string) => {
          return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        },
      },
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
