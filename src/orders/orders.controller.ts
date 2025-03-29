import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  Request,
  Body,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MembersService } from '../members/members.service';
import { User } from '../users/users.service';
import { getPotentialGroupDataRow } from '../../db/src/query_sql';

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
  ) {
    const potentialGroupData = await this.membersService.getPotentialGroupData(
      req.user.email,
    );
    //check if potentialGroupData have more than 1 member
    let haveLength = false;
    if (potentialGroupData.length > 1) {
      haveLength = true;
    }
    const checkoutData = await this.ordersService.getCheckoutData(
      referenceId,
      req.user,
    );
    return {
      ...checkoutData,
      haveLength,
      potentialGroupData,
    };
  }

  @Get('checkout-group/:referenceId')
  @Render('orders/checkout-group')
  async checkoutGroup(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
  ) {
    const potentialGroupData = await this.membersService.getPotentialGroupData(
      req.user.email,
    );

    //check if potentialGroupData have more than 1 member
    let haveLength = false;
    if (potentialGroupData.length > 1) {
      haveLength = true;
    }

    const checkoutData = await this.ordersService.getCheckoutGroupData(
      referenceId,
      req.user,
      potentialGroupData,
    );

    return {
      ...checkoutData,
      haveLength,
      potentialGroupData,
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
    const retval = await this.ordersService.processPayment(
      req.user,
      referenceId,
      paymentMethod,
      parseFloat(paymentGatewayFee),
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

  //get payment url by reference id and ask client to redirect to payment url
  @Post('payment/:referenceId/redirect')
  async redirect(@Param('referenceId') referenceId: string) {
    const paymentUrl =
      await this.ordersService.getPaymentUrlByReferenceId(referenceId);
    return `<script>window.location.href = '${paymentUrl}';</script>`;
  }
}
