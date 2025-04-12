import { Controller, Get, Render, Post, Param, Query } from '@nestjs/common';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { FoService } from './fo.service';
import Sqids from 'sqids';
import { MembersService } from 'src/members/members.service';

interface AdditionalData {
  picUrl: string | undefined;
}

@Controller('fo')
export class FoController {
  constructor(
    private readonly foService: FoService,
    private readonly membersService: MembersService,
  ) {}

  @Get('waiting-payment-method-orders')
  @Roles('front-officer')
  @Render('fo/waiting-payment-method-orders')
  async waitingPaymentOrders() {
    const orders = await this.foService.getWaitingPaymentOrders();
    return {
      orders,
    };
  }

  //endpoint for /fo?i=<squids_id>
  @Get('')
  @Roles('front-officer')
  @Render('members/visit')
  async memberCheckin(@Query('i') id: string) {
    const sqids = new Sqids({
      alphabet: process.env.ALPHABET_ID || 'abcdefghijklmnopqrstuvwxyz',
    });
    const memberId = sqids.decode(id);
    const memberFromDb = await this.membersService.getMemberById(memberId[0]);

    if (!memberFromDb) {
      return {
        status: null,
        message: 'Member not found',
      };
    }

    const member = {
      email: memberFromDb.email || '',
      picUrl: (memberFromDb.additionalData as AdditionalData).picUrl || '',
    };

    //call member service to create visit
    const visit = await this.membersService.createVisit(
      member.email,
      member.picUrl,
    );

    // Mock weekly visits data
    const weeklyVisits = await this.membersService.getWeeklyVisitsByEmail(
      member.email,
    );

    const monthlyVisits = await this.membersService.getMonthlyVisitsByEmail(
      member.email,
    );

    if (!visit) {
      return {
        status: null,
        message: 'Failed to create visit',
      };
    }
    return {
      status: 'success',
      email: visit.email,
      picUrl: visit.picUrl,
      checkInTime: visit.checkInTime,
      visitCode: visit.visitCode,
      weeklyVisits: weeklyVisits,
      monthlyVisits: monthlyVisits,
    };
  }

  @Post('orders/:referenceId/extend15/:toggle')
  @Roles('front-officer')
  @Render('fo/waiting-payment-method-order-button')
  async extend15On(
    @Param('referenceId') referenceId: string,
    @Param('toggle') toggle: boolean,
  ) {
    const response = await this.foService.extend15(referenceId, toggle);
    console.log(response);
    return response;
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

  @Post('orders/:referenceId/extend60/:toggle')
  @Roles('front-officer')
  @Render('fo/waiting-payment-method-order-button')
  async extend60On(
    @Param('referenceId') referenceId: string,
    @Param('toggle') toggle: boolean,
  ) {
    const response = await this.foService.extend60(referenceId, toggle);
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

  @Post('orders/:referenceId/cashback50/:toggle')
  @Roles('front-officer')
  @Render('fo/waiting-payment-method-order-button')
  async cashback50On(
    @Param('referenceId') referenceId: string,
    @Param('toggle') toggle: boolean,
  ) {
    const response = await this.foService.cashback50(referenceId, toggle);
    console.log(response);
    return response;
  }
}
