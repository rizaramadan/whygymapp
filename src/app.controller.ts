import { Controller, Get, Render, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './users/users.service';
import { Roles } from './roles/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/user-dashboard')
  @Render('user-dashboard')
  dashboard(@Request() req: { user: User }) {
    return {
      user: req.user,
    };
  }

  @Get('/admin-dashboard')
  @Render('user-dashboard')
  @Roles('admin')
  adminDashboard(@Request() req: { user: User }) {
    return {
      user: req.user,
    };
  }
}
