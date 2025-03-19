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
}
