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
import { User } from '../users/users.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('checkout/:referenceId')
  @Render('orders/checkout')
  async checkout(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
  ) {
    return await this.ordersService.getCheckoutData(referenceId, req.user);
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
    console.log(retval);
    return retval;
  }

  @Get('payment/:referenceId/fail')
  @Render('orders/fail')
  async fail(@Param('referenceId') referenceId: string) {
    await this.ordersService.insertOrderStatusLog(referenceId, 'fail');
    return await this.ordersService.getOrderAndMemberByReferenceId(referenceId);
  }
}
