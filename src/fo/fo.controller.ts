import { Controller, Get, Render, Post, Param, Query, Body } from '@nestjs/common';
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

    //check if member additionalData weekendOnly is true
    const weekendOnly = memberFromDb.additionalData?.weekendOnly;
    //if weekendOnly is True, then if today is not friday, saturday, sunday, then return error
    if (weekendOnly) {
      const jakartaTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      if (![0, 6].includes(jakartaTime.getDay())) {
        return {
          status: null,
          message: 'Member is not allowed to check in on this day',
        };
      }
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
      fullName: memberFromDb.additionalData?.fullName,
    };
  }


  @Get('scanner')
  @Roles('front-officer')
  @Render('fo/scanner')
  async scanner() {
    return {};
  }

  @Post('scanner')
  @Roles('front-officer')
  @Render('members/visit-content-only')
  async scannerPost(@Body('barcode') barcode: string) {
    //barcode data will be https://whygym.mvp.my.id/fo?i=abc123, extract the i value if start with https://whygym.mvp.my.id/fo?i=
    const id = barcode.split('whygym.mvp.my.id/fo?i=')[1];
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

    //check if member additionalData weekendOnly is true
    const weekendOnly = memberFromDb.additionalData?.weekendOnly;
    //if weekendOnly is True, then if today is not friday, saturday, sunday, then return error
    if (weekendOnly) {
      const jakartaTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      if (![0, 6].includes(jakartaTime.getDay())) {
        return {
          status: null,
          message: 'Member is only allowed to check in on weekend',
        };
      }
    }

    const member = {
      email: memberFromDb.email || '',
      picUrl: (memberFromDb.additionalData as AdditionalData).picUrl || '',
    };

    //get member expire date
    const duration = await this.membersService.getMemberDurationData(memberFromDb.id);
    let expireDate = memberFromDb.startDate || new Date();
    expireDate.setDate(expireDate.getDate() + duration);


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

    if (await this.foService.getCheckExpireDate()) {
      //if expire date is in the past, then return error
      if (expireDate < new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))) {
        return {
          status: null,
          message: 'Member is expired',
        };
      }
    }

    return {
      status: 'success',
      email: visit.email,
      picUrl: visit.picUrl,
      checkInTime: visit.checkInTime,
      visitCode: visit.visitCode,
      weeklyVisits: weeklyVisits,
      monthlyVisits: monthlyVisits,
      expireDate: expireDate,
      fullName: memberFromDb.additionalData?.fullName,
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

  @Get('active-member-breakdown')
  @Roles('front-officer')
  @Render('fo/active-member-breakdown')
  async getActiveMemberBreakdown(
  ) {
    
    const breakdown = await this.membersService.getActiveMemberBreakdown();
    return { breakdown };
  }
}
