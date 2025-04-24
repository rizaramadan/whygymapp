import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  Request,
  Body,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MembersService } from '../members/members.service';
import { User } from '../users/users.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly membersService: MembersService,
  ) {}

  @Get('checkout/:referenceId')
  @Render('orders/checkout')
  async checkout(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
    @Query('type') type: string,
  ) {
    const potentialGroupData = await this.membersService.getPotentialGroupData(
      req.user.email,
    );
    //check if potentialGroupData have more than 1 member
    let haveLength = false;
    if (potentialGroupData.length > 1) {
      haveLength = true;
    }
    const checkoutData = haveLength
      ? { referenceId }
      : await this.ordersService.getCheckoutData(referenceId, req.user);
    return {
      ...checkoutData,
      haveLength,
      potentialGroupData,
      type,
    };
  }

  @Get('checkout-group/:referenceId')
  @Render('orders/checkout-group')
  async checkoutGroup(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
  ) {
    console.log(req.user);

    const potentialGroupData = await this.membersService.getPotentialGroupData(
      req.user.email,
    );

    console.log(potentialGroupData);

    //check if potentialGroupData have more than 1 member
    let haveLength = false;
    if (potentialGroupData.length > 1) {
      haveLength = true;
    }

    console.log(potentialGroupData);

    const checkoutData = await this.ordersService.getCheckoutGroupData(
      referenceId,
      req.user,
      potentialGroupData,
    );

    return {
      ...checkoutData,
      haveLength,
      potentialGroupData,
      payer: req.user.email,
    };
  }

  @Get('checkout-group-by-admin/:referenceId')
  @Render('orders/checkout-group')
  async checkoutGroupByAdmin(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
    @Query('email') email: string,
  ) {
    

    const potentialGroupData = await this.membersService.getPotentialGroupData(
      email,
    );

    console.log(potentialGroupData);

    //check if potentialGroupData have more than 1 member
    let haveLength = false;
    if (potentialGroupData.length > 1) {
      haveLength = true;
    }

    console.log(potentialGroupData);

    const checkoutData = await this.ordersService.getCheckoutGroupData(
      referenceId,
      req.user,
      potentialGroupData,
    );

    return {
      ...checkoutData,
      haveLength,
      potentialGroupData,
      payer: req.user.email,
    };
  }

  @Post('payment/:referenceId')
  @Render('orders/payment')
  async payment(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
    @Body('selectedMethod') paymentMethod: string,
    @Body('paymentGatewayFee') paymentGatewayFee: string,
  ) {
    const potentialGroupData = await this.membersService.getPotentialGroupData(
      req.user.email,
    );
    //check if potentialGroupData have more than 1 member
    let haveLength = false;
    if (potentialGroupData.length > 1) {
      haveLength = true;
    }

    console.log(haveLength);

    const retval = await this.ordersService.processPayment(
      req.user,
      referenceId,
      paymentMethod,
      parseFloat(paymentGatewayFee),
    );
    return { ...retval, haveLength };
  }

  @Post('payment-private-coaching-fee/:referenceId')
  @Render('orders/payment')
  async paymentPrivateCoaching(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
    @Body('selectedMethod') paymentMethod: string,
    @Body('paymentGatewayFee') paymentGatewayFee: string,
  ) {
    const retval = await this.ordersService.processPaymentPrivateCoachingFee(
      req.user,
      referenceId,
      paymentMethod,
      parseFloat(paymentGatewayFee),
    );
    console.log(retval);
    return { ...retval, type: 'private-coaching-fee' };
  }

  @Post('payment-group/:referenceId')
  @Render('orders/payment-group')
  async paymentGroup(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
    @Body('selectedMethod') paymentMethod: string,
    @Body('paymentGatewayFee') paymentGatewayFee: string,
  ) {
    const potentialGroupData = await this.membersService.getPotentialGroupData(
      req.user.email,
    );

    const retval = await this.ordersService.processPaymentGroup(
      req.user,
      referenceId,
      paymentMethod,
      parseFloat(paymentGatewayFee),
      potentialGroupData,
    );
    return retval;
  }

  @Get('payment/:referenceId/success')
  @Render('orders/success')
  async success(@Param('referenceId') referenceId: string) {
    await this.ordersService.insertOrderStatusLog(referenceId, 'success');
    const retval =
      await this.ordersService.getOrderAndMemberByReferenceId(referenceId);
    return retval;
  }

  @Get('payment/:referenceId/complete')
  @Render('orders/complete')
  async complete(@Param('referenceId') referenceId: string) {
    return await this.ordersService.setInvoiceStatusResponseAndActivateMembership(
      referenceId,
    );
  }

  @Get('payment/:referenceId/fail')
  @Render('orders/fail')
  async fail(@Param('referenceId') referenceId: string) {
    await this.ordersService.insertOrderStatusLog(referenceId, 'fail');
    return await this.ordersService.getOrderAndMemberByReferenceId(referenceId);
  }

  @Get('payment-private-coaching-fee/:referenceId/success')
  @Render('orders/success-private-coaching')
  async successPrivateCoachingFee(@Param('referenceId') referenceId: string) {
    await this.ordersService.insertOrderStatusLog(referenceId, 'success');
    const retval =
      await this.ordersService.getOrderAndPrivateCoachingByReferenceId(
        referenceId,
      );
    return retval;
  }

  @Get('payment-private-coaching-fee/:referenceId/complete')
  @Render('orders/complete')
  async completePrivateCoachingFee(@Param('referenceId') referenceId: string) {
    return await this.ordersService.setInvoiceStatusResponseAndActivatePrivateCoaching(
      referenceId,
    );
  }

  @Get('payment-private-coaching-fee/:referenceId/fail')
  @Render('orders/fail')
  async failPrivateCoachingFee(@Param('referenceId') referenceId: string) {
    await this.ordersService.insertOrderStatusLog(referenceId, 'fail');
    return await this.ordersService.getOrderAndPrivateCoachingByReferenceId(
      referenceId,
    );
  }

  //get payment url by reference id and ask client to redirect to payment url
  @Post('payment/:referenceId/redirect')
  async redirect(@Param('referenceId') referenceId: string) {
    const paymentUrl =
      await this.ordersService.getPaymentUrlByReferenceId(referenceId);
    return `<script>window.location.href = '${paymentUrl}';</script>`;
  }

  @Post('checkout-group-update/:referenceId/:action/:memberId')
  @Render('orders/checkout-group-update')
  async updateCheckoutGroup(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
    @Param('action') action: string,
    @Param('memberId') memberId: string,
  ) {
    if (action === 'uncheck') {
      await this.ordersService.removeFromGroup(memberId);
    } else if (action === 'check') {
      await this.ordersService.joinToGroup(referenceId, memberId);
    }

    const potentialGroupData = await this.membersService.getPotentialGroupData(
      req.user.email,
    );

    const checkoutData = await this.ordersService.getCheckoutGroupData(
      referenceId,
      req.user,
      potentialGroupData,
    );

    return {
      ...checkoutData,
      haveLength: potentialGroupData.length > 1,
      potentialGroupData,
      payer: req.user.email,
    };
  }
}
