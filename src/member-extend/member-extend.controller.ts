import { Controller, Get, Post, Render, Request, Body, Param, Query, Redirect, Res } from '@nestjs/common';
import { MemberExtendService } from './member-extend.service';
import { MembersService } from '../members/members.service';
import { User } from '../users/users.service';
import { Response } from 'express';

@Controller('member-extend')
export class MemberExtendController {
  constructor(
    private readonly memberExtendService: MemberExtendService,
    private readonly membersService: MembersService,
  ) {}

  @Get('request')
  @Render('member-extend/request')
  async showExtensionRequest(@Request() req: { user: User }) {
    const memberActiveDate = await this.membersService.getMemberActiveDate(req.user.email);
    
    if (!memberActiveDate) {
      return {
        error: 'You must have an active membership to extend it.',
        redirectUrl: '/member-dashboard'
      };
    }

    // Get additional member details for the template
    const memberDetails = await this.membersService.getActiveMembershipByEmail(req.user.email);
    
    // Calculate days remaining
    const today = new Date();
    const daysRemaining = Math.ceil((memberActiveDate.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Combine the data for the template
    const memberData = {
      id: memberActiveDate.id,
      email: req.user.email,
      nickname: memberDetails?.nickname || 'Member',
      membershipStatus: memberDetails?.membershipStatus || 'active',
      startDate: memberActiveDate.startDate,
      endDate: memberActiveDate.endDate,
      duration: memberActiveDate.duration,
      daysRemaining: Math.max(0, daysRemaining),
      gender: memberDetails?.additionalData?.gender || 'male',
    };

    const extensionOptions = await this.memberExtendService.getExtensionOptions(memberData);
    
    return {
      member: memberData,
      extensionOptions,
      user: req.user
    };
  }

  @Post('request')
  async processExtensionRequest(
    @Request() req: { user: User },
    @Body('selectedDuration') selectedDuration: string,
  ) {
    const referenceId = await this.memberExtendService.createExtensionOrder(
      req.user.email,
      parseInt(selectedDuration)
    );
    
    return {
        redirectUrl: `/member-extend/checkout/${referenceId}`
    }
  }

  @Get('checkout/:referenceId')
  @Render('member-extend/checkout')
  async showCheckout(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
  ) {
    const memberActiveDate = await this.membersService.getMemberActiveDate(req.user.email);
    
    if (!memberActiveDate) {
      return {
        error: 'You must have an active membership to extend it.',
        redirectUrl: '/member-dashboard'
      };
    }
    const checkoutData = await this.memberExtendService.getCheckoutData(referenceId, req.user.email, memberActiveDate);
    
    if (!checkoutData) {
      return {
        error: 'Extension order not found or invalid.',
        redirectUrl: '/member-extend/request'
      };
    }

    const paymentMethods = await this.memberExtendService.getPaymentMethods();
    
    return {
      ...checkoutData,
      paymentMethods,
      user: req.user,
      referenceId
    };
  }

  @Post('payment/:referenceId')
  @Render('member-extend/payment')
  async processPayment(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
    @Body('selectedMethod') paymentMethod: string,
    @Body('paymentGatewayFee') paymentGatewayFee: string,
  ) {
    const paymentData = await this.memberExtendService.processPayment(
      req.user.email,
      referenceId,
      paymentMethod,
      parseFloat(paymentGatewayFee)
    );
    
    return {
      ...paymentData,
      referenceId
    };
  }

  @Get('payment/:referenceId/success')
  @Render('member-extend/success')
  async paymentSuccess(@Param('referenceId') referenceId: string) {
    const successData = await this.memberExtendService.handlePaymentSuccess(referenceId);
    
    return {
      ...successData,
      referenceId
    };
  }

  @Get('payment/:referenceId/failed')
  @Render('member-extend/failed')
  async paymentFailed(@Param('referenceId') referenceId: string) {
    const failureData = await this.memberExtendService.handlePaymentFailure(referenceId);
    
    return {
      ...failureData,
      referenceId
    };
  }

  @Get('payment/:referenceId/cancelled')
  @Redirect('/member-extend/request?cancelled=true')
  async paymentCancelled(@Param('referenceId') referenceId: string) {
    // Redirect is handled by the decorator
  }

  @Post('callback')
  async paymentCallback(@Body() callbackData: any) {
    return await this.memberExtendService.handlePaymentCallback(callbackData);
  }
}
