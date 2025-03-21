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
    return {
      orders,
    };
  }

  @Post('orders/:referenceId/extend30/:toggle')
  @Roles('front-officer')
  @Render('fo/waiting-payment-method-order-button')
  async extend30On(
    @Param('referenceId') referenceId: string,
    @Param('toggle') toggle: boolean,
  ) {
    const response = await this.foService.extend30(referenceId, toggle);
    console.log(response);
    return response;
  }

  @Post('orders/:referenceId/extend90/:toggle')
  @Roles('front-officer')
  @Render('fo/waiting-payment-method-order-button')
  async extend90On(
    @Param('referenceId') referenceId: string,
    @Param('toggle') toggle: boolean,
  ) {
    const response = await this.foService.extend90(referenceId, toggle);
    console.log(response);
    return response;
  }

  @Post('orders/:referenceId/cashback100/:toggle')
  @Roles('front-officer')
  @Render('fo/waiting-payment-method-order-button')
  async cashback100On(
    @Param('referenceId') referenceId: string,
    @Param('toggle') toggle: boolean,
  ) {
    const response = await this.foService.cashback100(referenceId, toggle);
    console.log(response);
    return response;
  }

  @Post('orders/:referenceId/cashback200/:toggle')
  @Roles('front-officer')
  @Render('fo/waiting-payment-method-order-button')
  async cashback200On(
    @Param('referenceId') referenceId: string,
    @Param('toggle') toggle: boolean,
  ) {
    const response = await this.foService.cashback200(referenceId, toggle);
    console.log(response);
    return response;
  }
}
