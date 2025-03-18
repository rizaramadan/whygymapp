import { Controller, Get, Render, Post, Param } from '@nestjs/common';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { FoService } from './fo.service';

@Controller('fo')
export class FoController {
  constructor(private readonly foService: FoService) {}

  @Get('waiting-payment-method-orders')
  @Roles('front-officer')
  @Render('fo/waiting-payment-method-orders')
  async waitingPaymentOrders() {
    const orders = await this.foService.getWaitingPaymentOrders();
    console.log(orders);

    return {
      orders,
    };
  }

  @Post('orders/:referenceId/cashback')
  @Roles('front-officer')
  async giveCashback(@Param('referenceId') referenceId: string) {
    await this.foService.giveCashback(referenceId);
    const orders = await this.foService.getWaitingPaymentOrders();
    return orders;
  }

  @Post('orders/:referenceId/extend')
  @Roles('front-officer')
  async extendMembership(@Param('referenceId') referenceId: string) {
    await this.foService.extendMembership(referenceId);
    const orders = await this.foService.getWaitingPaymentOrders();
    return orders;
  }
}
