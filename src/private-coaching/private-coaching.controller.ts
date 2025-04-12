import { Controller, Post, Body, Request } from '@nestjs/common';
import { User } from 'src/users/users.service';
import {
  PrivateCoachingApplyDto,
  PrivateCoachingService,
} from './private-coaching.service';

@Controller('private-coaching')
export class PrivateCoachingController {
  constructor(
    private readonly privateCoachingService: PrivateCoachingService,
  ) {}

  @Post('apply')
  async apply(
    @Body() body: PrivateCoachingApplyDto,
    @Request() req: { user: User },
  ) {
    console.log(body.trainingType);
    const result = await this.privateCoachingService.apply(body, req.user);

    if (!result) {
      return {
        error: 'submission_failed',
      };
    }

    return `<script>window.location.href="/orders/checkout/${result.mainReferenceId}?type=private-coaching-fee"</script>`;
  }

  /*@Post('apply')
  @Redirect()
  async apply(
    @Request() req: { user: User },
    @Body() applicationData: MembershipApplicationDto,
  ) {
    try {
      const result = await this.membersService.processMembershipApplication(
        req.user,
        applicationData,
      );

      if (result) {
        // Successful submission - redirect to payment page
        return {
          url: `/orders/checkout/${result.mainReferenceId}`,
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
  }*/
}
