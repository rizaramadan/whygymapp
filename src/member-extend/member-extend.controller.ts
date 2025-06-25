import { Controller, Get, Post, Render, Request, Body, Param, Query, Redirect, HttpException, HttpStatus } from '@nestjs/common';
import { MemberData, MemberExtendService } from './member-extend.service';
import { MembersService } from '../members/members.service';
import { User } from '../users/users.service';
import { Response } from 'express';
import { PaymentInput, PaymentResponse } from './member-extend.interfaces';
import { Public } from 'src/auth/decorators/public.decorator';

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

    const extraTime = await this.membersService.getMemberDurationData(memberActiveDate?.id || 0);
    const activeUntil = new Date(memberActiveDate?.startDate || new Date()); 
    activeUntil.setDate(activeUntil.getDate() + extraTime);
    memberActiveDate.endDate = activeUntil;

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
    //duplicate code from GET /request because we need to check if the member has an active membership
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

    const memberData : MemberData = {
        id: memberActiveDate.id,
        email: req.user.email,
        nickname: memberDetails?.nickname || 'Member',
        membershipStatus: memberDetails?.membershipStatus || 'active',
        startDate: memberActiveDate.startDate || new Date(),
        endDate: memberActiveDate.endDate || new Date(),
        duration: parseInt(memberActiveDate.duration?.toString() || '0'),
        daysRemaining: Math.max(0, daysRemaining),
        gender: memberDetails?.additionalData?.gender || 'male',
      };

    console.log(parseInt(selectedDuration));
    const referenceId = await this.memberExtendService.createExtensionOrder(
      req.user.email,
      memberData,
      parseInt(selectedDuration)
    );
    
    return `<script>window.location.href = '/member-extend/checkout/${referenceId}';</script>`
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
        redirectUrl: '/member-extend/request'
      };
    }
    const checkoutData = await this.memberExtendService.getCheckoutData(referenceId, req.user.email, memberActiveDate);
    
    if (!checkoutData) {
      return {
        error: 'Extension order not found or invalid.',
        redirectUrl: '/member-extend/request'
      };
    }

    const paymentMethods = await this.memberExtendService.getPaymentMethods(checkoutData.total);
    
    return {
      ...checkoutData,
      paymentMethods,
      user: req.user,
      referenceId
    };
  }

  @Post('payment/:referenceId')
  async processPayment(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
    @Body('selectedMethod') paymentMethod: string,
    @Body('paymentGatewayFee') paymentGatewayFee: string,
    @Body('total') total: number,
    @Body('subtotal') subtotal: number,
    @Body('tax') tax: number,
    @Body('extensionDuration') extensionDuration: string,
    @Body('currentExpiry') currentExpiry: Date,
    @Body('newExpiry') newExpiry: Date,
  ) {
    const paymentData = await this.memberExtendService.processPayment(
      req.user.fullName,
      referenceId,
      paymentMethod,
      total
    );

    return `<script>window.location.href = '${paymentData.data.paymentUrl}';</script>`;
  }

  @Get('payment/:referenceId/success')
  @Render('member-extend/success')
  async paymentSuccess(@Param('referenceId') referenceId: string) {
    return {
      referenceId
    };
  }

  @Get('payment/:referenceId/complete')
  @Render('member-extend/success')
  async paymentComplete(@Param('referenceId') referenceId: string) {
    const invoiceData = await this.memberExtendService.getCurrentInvoiceData(referenceId);
    console.log(invoiceData);
    return {
      invoiceData
    };
  }

  @Get('payment/:referenceId/fail')
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

  @Public()
  @Get('member-extend-payment-data')
  @Render('members-extend/payment-data')
  async getAccountingData(
    @Query('key') key: string,
    @Query('value') value: string,
  ) {
    if (key !== process.env.ACTIVE_MEMBER_BREAKDOWN_KEY) {
      throw new HttpException('Invalid key', HttpStatus.UNAUTHORIZED);
    }
    if (value !== process.env.ACTIVE_MEMBER_BREAKDOWN_VALUE) {
      throw new HttpException('Invalid key', HttpStatus.UNAUTHORIZED);
    }
    const data = await this.memberExtendService.getExtensionOrderExtraTime();
    return { data };
  }
}
