import { Controller, Get, Param, Render, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { User } from '../users/users.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('checkout/:referenceId')
  @Render('orders/payment')
  async payment(
    @Request() req: { user: User },
    @Param('referenceId') referenceId: string,
  ) {
    const order = await this.ordersService.getOrderByReferenceId(referenceId);
    const { paymentMethod } = await this.ordersService.getPaymentMethods(
      parseFloat(order?.price || '0'),
    );

    const paymentDetails = this.ordersService.calculatePaymentDetails(
      order,
      paymentMethod,
    );

    return {
      user: req.user,
      referenceId: referenceId,
      memberId: order?.memberId,
      ...paymentDetails,
      order,
      paymentOptions: this.ordersService.getPaymentOptions(),
    };
  }
}
