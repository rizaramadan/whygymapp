import {
  Controller,
  Get,
  Request,
  Render,
  Query,
  Post,
  Body,
  Redirect,
  Param,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { User } from '../users/users.service';
import { MembersService } from './members.service';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { MembershipApplicationDto } from './dto/membership-application.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('visit')
  @Render('members/visit')
  async visit(@Request() req: { user: User }) {
    //call member service to create visit
    const visit = await this.membersService.createVisit(
      req.user.email,
      req.user.picUrl,
    );

    // Mock weekly visits data
    const weeklyVisits = [
      { week: 'week 8', count: 1 },
      { week: 'week 9', count: 4 },
      { week: 'week 10', count: 2 },
      { week: 'week 11', count: 3 },
      { week: 'week 12', count: 5 },
    ];

    if (!visit) {
      return {
        status: null,
        message: 'Failed to create visit',
      };
    }
    return {
      status: 'success',
      email: visit.email,
      picUrl: visit.picUrl,
      checkInTime: visit.checkInTime,
      visitCode: visit.visitCode,
      weeklyVisits: weeklyVisits,
    };
  }

  @Get('new-visitors')
  @Roles('front-officer')
  @Render('members/new-visitors')
  async newVisitors(@Query('lastVisitId') lastVisitId: string) {
    const visitors = await this.membersService.getNewVisitors(lastVisitId);
    const newLastVisitId = await this.membersService.getLastVisitId();
    return { visitors, lastVisitId: newLastVisitId?.id || '' };
  }

  @Get('last-visit-id')
  @Roles('front-officer')
  async lastVisitId() {
    const lastVisitId = await this.membersService.getLastVisitId();
    return lastVisitId?.id || '';
  }

  @Get('membership-apply')
  @Render('members/membership-apply')
  getApply() {
    return {
      getCurrentDate: new Date().toISOString().split('T')[0],
    };
  }

  @Post('membership-apply')
  @Redirect()
  async submitMembershipApplication(
    @Request() req: { user: User },
    @Body() applicationData: MembershipApplicationDto,
  ) {
    try {
      const result = await this.membersService.processMembershipApplication(
        req.user,
        applicationData,
      );

      if (result) {
        // Successful submission - redirect to success page
        return {
          url: '/user-dashboard',
          statusCode: 302,
        };
      } else {
        // Failed submission - redirect back to form with error
        return {
          url: '/members/membership-apply?error=submission_failed',
          statusCode: 302,
        };
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      return {
        url: '/members/membership-apply?error=unexpected_error',
        statusCode: 302,
      };
    }
  }

  @Get('application-success')
  @Render('members/application-success')
  getApplicationSuccess() {
    return {};
  }

  @Delete('cancel-application/:id')
  @Render('user-dashboard')
  async cancelApplication(
    @Param('id') id: string,
    @Request() req: { user: User },
  ) {
    try {
      const result = await this.membersService.deletePendingMembership(
        parseInt(id),
        req.user.email,
      );

      if (!result) {
        throw new HttpException(
          'Failed to cancel membership application',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Return the data needed for the dashboard template
      return {
        url: '/user-dashboard',
        statusCode: 302,
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'An error occurred while cancelling the application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
