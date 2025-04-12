import { Controller, Post, Body, Redirect } from '@nestjs/common';

@Controller('private-coaching')
export class PrivateCoachingController {
  @Post('apply')
  async apply(@Body() body: any) {
    console.log(body);
    return {
      body,
      message: 'Private coaching application submitted successfully',
    };
  }

  @Post('apply')
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
  }
}
