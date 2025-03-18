import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { Request } from 'express';
import { FoService } from './fo.service';

@Controller('fo')
export class FoController {
  constructor(private readonly foService: FoService) {}

  @Get('waiting-payment-method-orders')
  @Roles('front-officer')
  async waitingPaymentOrders(@Req() req: Request) {
    const orders = await this.foService.getWaitingPaymentOrders();
    
    // If it's an HTMX request, return partial view
    if (req.headers['hx-request']) {
      return orders;
    }
    
    // Otherwise render full page
    return {
      view: 'fo/waiting-payment-method-orders',
      data: {
        orders,
      },
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
