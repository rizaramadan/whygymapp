import {
  Controller,
  Get,
  Render,
  Request,
  Res,
  Param,
  Sse,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { User, UsersService } from './users/users.service';
import { Roles } from './roles/decorators/roles.decorator';
import { MembersService } from './members/members.service';
import { Response } from 'express';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Sqids from 'sqids';
import { Public } from './auth/decorators/public.decorator';

interface ToggleWeekendOnlyDto {
  enabled: boolean;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly membersService: MembersService,
    private readonly usersService: UsersService,
  ) {}

  @Get('/health')
  @Public()
  health() {
    return { status: 'ok' };
  }

  @Get('/')
  getHello() {
    return '<script>window.location.href="https://whygym.id"</script>';
  }


  @Get('/pretest')
  @Public()
  @Render('pretest')
  getPretest() {
    return {};
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
    let memberActiveDate = await this.membersService.getMemberActiveDate(
      req.user.email,
    );

    if (!memberActiveDate) {
      throw new Error('Member active date not found');
    }

    const memberId = await this.membersService.getMemberIdByEmail(
      req.user.email,
    );

    console.log(memberId?.id.toString() || '');

    await this.membersService.addOrUpdateMemberPicUrl(
      req.user.email,
      `"${req.user.picUrl}"`,
    );

    const extraTime = await this.membersService.getMemberDurationData(memberId?.id || 0);

    const sqids = new Sqids({
      alphabet: process.env.ALPHABET_ID || 'abcdefghijklmnopqrstuvwxyz',
    });
    const id = sqids.encode([memberId?.id || 0, 9, 9]);


    //add days from extraTime to memberActiveDate.endDate
    const activeUntil = new Date(memberActiveDate?.startDate || new Date()); 
    activeUntil.setDate(activeUntil.getDate() + extraTime);
    memberActiveDate.endDate = activeUntil;
    return {
      user: req.user,
      memberActiveDate,
      id,
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

  @Get('/rtwa')
  async redirectToWaChat(@Request() req: { user: User }) {
    const result = req?.user;
    const member = await this.membersService.getMemberIdByEmail(result.email);
    const gender = member?.additionalData?.gender || '';
    const genderText = gender === 'male' ? 'laki-laki' : 'Perempuan';
    const genderLink = gender === 'male' ? 'https://whygym.id/wgm' : 'https://whygym.id/wgf';
    const msg = `Hi Gym Min!,
Mau konfirmasi, ini WhatsApp dari Member atas nama ${result.fullName} dengan email ${result.email}
    \n
INFO : Dapatkan info dan promo paling update dengan bergabung ke group whatsapp member khusus ${genderText} di link berikut : ${genderLink}.
    \n
Tenang aja! group ini terpisah laki-laki dan perempuan, dan kami hanya akan menginfokan hal2 terkait whygym bogor`;

    const waChatUrl = `https://wa.me/6281298241472?text=${encodeURIComponent(msg)}`;
    return `<script>window.location.href = "${waChatUrl}";</script>`;
  }

  @Get('/logout')
  @Public()
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
      map(() => ({ data: { hello: 'world' } }) as MessageEvent),
    );
  }

  @Get('weekend-only')
  async getWeekendOnly() {
    try {
      const enabled = await this.appService.getWeekendOnly();
      return { enabled };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Failed to get weekend-only status');
    }
  }

  @Post('weekend-only-toggle')
  @Roles('admin')
  @Render('post-toggle-weekend-only')
  async toggleWeekendOnly() {
    try {
      const weekendOnly = await this.appService.getWeekendOnly();
      if (weekendOnly) {
        await this.appService.disableWeekendOnly();
      } else {
        await this.appService.enableWeekendOnly();
      }

      return {
        weekendOnly: await this.appService.getWeekendOnly(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Failed to toggle weekend-only status');
    }
  }

  @Get('weekend-only-toggle')
  @Roles('admin')
  @Render('toggle-weekend-only')
  async toggleWeekendOnlyView() {
    return {
      weekendOnly: await this.appService.getWeekendOnly(),
    };
  }

  @Post('ws/v1/cluster/apps/new-application')
  @Public()
  async postWsV1ClusterAppsNewApplication() {
    return new BadRequestException('Bad Request');
  }

  @Get('ws/v1/cluster/apps/new-application')
  @Public()
  async getWsV1ClusterAppsNewApplication() {
    return new BadRequestException('Bad Request');
  }
}
