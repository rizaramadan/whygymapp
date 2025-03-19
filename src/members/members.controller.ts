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
  // Define static property for payment options
  private static paymentOptions = [
    {
      id: 'qris',
      name: 'QRIS',
      description: 'Pay using any QRIS-supported e-wallet',
    },
  ];

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
    const weeklyVisits = await this.membersService.getWeeklyVisitsByEmail(
      req.user.email,
    );

    const monthlyVisits = await this.membersService.getMonthlyVisitsByEmail(
      req.user.email,
    );

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
      monthlyVisits: monthlyVisits,
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
          url: `/members/payment/${result.referenceId}`,
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

  @Get('payment/:referenceId')
  @Render('members/payment')
  async payment(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
  ) {
    const order = await this.membersService.getOrderByReferenceId(referenceId);
    const paymentMethod = await this.membersService.getPaymentMethods(
      parseFloat(order?.price || '0'),
    );
    // Mock payment data
    const membershipFee = parseFloat(order?.price || '0');
    const taxRate = 0.11; // 11% tax
    const tax = membershipFee * taxRate;
    let total = membershipFee + tax;

    if (order?.additionalInfo?.cashback100) {
      total -= 100000;
    }
    if (order?.additionalInfo?.cashback200) {
      total -= 200000;
    }
    return {
      user: req.user,
      memberId: order?.memberId,
      membershipFee,
      paymentMethod,
      tax,
      total,
      order,
      paymentOptions: MembersController.paymentOptions, // Access static property
    };
  }

  @Post('process-payment')
  @Redirect()
  async processPayment(
    @Request() req: { user: User },
    @Body() paymentData: { paymentMethod: string },
  ) {
    try {
      // Here you would implement the actual payment processing logic
      // For now, we'll just return the redirect response
      const redirectUrl = `/members/payment/${paymentData.paymentMethod}/instructions`;
      await Promise.resolve(); // Add await to satisfy the linter
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        url: '/members/payment?error=payment_failed',
        statusCode: 302,
      };
    }
  }
}
