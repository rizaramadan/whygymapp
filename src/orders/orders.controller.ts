import { Controller, Get, Param, Post, Render, Request, Body } from '@nestjs/common';
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
    //call AUTH_API_URL/v1/payment/methods with body {"amount": price}, price from order retrieved using referenceId
    const order = await this.ordersService.getOrderByReferenceId(referenceId);
    
    const paymentMethods = await this.ordersService.getPaymentMethods(
      parseFloat(order?.price || '0'),
    );

    const retval = {
      user: req.user,
      referenceId: referenceId,
      order,
      paymentMethods,
    };
    console.log("payment method",paymentMethods);
    console.log("orders checkout retval:",retval);
    return retval;
  }

  @Post('payment/:referenceId')
  @Render('orders/payment')
  async payment(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
    @Body('selectedMethod') paymentMethod: string,
    @Body('paymentGatewayFee') paymentGatewayFee: string,
  ) {
    const order = await this.ordersService.getOrderByReferenceId(referenceId);

    const paymentDetails = this.ordersService.calculatePaymentDetails(
      order,
      parseFloat(paymentGatewayFee),
    );

    return {
      user: req.user,
      referenceId: referenceId,
      memberId: order?.memberId,
      ...paymentDetails,
      order,
      paymentMethod,
    };
  }
}
