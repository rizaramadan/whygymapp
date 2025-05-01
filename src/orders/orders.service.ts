import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  getOrderByReferenceId,
  getOrderByReferenceIdArgs,
  getOrderByReferenceIdRow,
  getOrderAndMemberByReferenceId,
  getOrderAndMemberByReferenceIdArgs,
  getOrderAndMemberByReferenceIdRow,
  insertOrderStatusLogArgs,
  insertOrderStatusLog,
  getPaymentUrlByReferenceId,
  getPaymentUrlByReferenceIdRow,
  getPotentialGroupDataRow,
  joinToGroupArgs,
  removeFromGroupArgs,
  joinToGroup,
  removeFromGroup,
  GetPrivateCoachingOrderReferenceIdByEmailArgs,
  getPrivateCoachingOrderReferenceIdByEmail,
  GetPrivateCoachingOrderReferenceIdByEmailRow,
  getOrderAndPrivateCoachingByReferenceId,
  getOrderAndPrivateCoachingByReferenceIdRow,
  getOrderAndPrivateCoachingByReferenceIdArgs,
  getPaymentUrlByReferenceIdArgs,
} from '../../db/src/query_sql';
import {
  setOrderInvoiceResponseArgs,
  setOrderInvoiceResponse,
  setInvoiceStatusResponseAndActivateMembershipArgs,
  setInvoiceStatusResponseAndActivateMembership,
  setOrderInvoiceRequestResponseArgs,
  setOrderInvoiceRequestResponse,
  setInvoiceStatusResponseAndActivatePrivateCoachingArgs,
  setInvoiceStatusResponseAndActivatePrivateCoaching,
} from '../../db/volatile/volatile_sql';  
import {
  CheckoutResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  PaymentMethodsResponse,
} from './orders.interfaces';
import { User } from '../users/users.service';
import {
  MemberData,
  MemberPricingService,
} from '../members/member-pricing.service';
import { MembersService } from '../members/members.service';
interface OrderWithAdditionalInfo {
  additionalInfo: {
    cashback50: boolean;
    cashback100: boolean;
    cashback200: boolean;
  };
  price: number;
}

interface OrderPrivateCoachingFeeData {
  additionalData: {
    coachType: string;
    sessionCount: number;
  };
}

interface OrderWithInvoiceId {
  additionalInfo: {
    invoice_response: {
      data: {
        id: string;
      };
    };
  };
}

interface CoachingOrderData {
  memberId: number;
  coachType: 'personal' | 'group';
  numberOfSessions: number;
  price: number;
  groupMembers?: number[];
}

@Injectable()
export class OrdersService {
  private readonly darisiniFee = 0;

  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private readonly httpService: HttpService,
    private readonly memberPricingService: MemberPricingService,
    private readonly membersService: MembersService,
  ) {}

  // Get order by reference id. Safe for other than membership application
  async getOrderByReferenceId(
    referenceId: string,
  ): Promise<getOrderByReferenceIdRow | null> {
    const args: getOrderByReferenceIdArgs = { referenceId };
    const result = await getOrderByReferenceId(this.pool, args);
    return result;
  }

  // get private coaching order by email.
  async getPrivateCoachingOrderByEmail(
    email: string,
  ): Promise<GetPrivateCoachingOrderReferenceIdByEmailRow | null> {
    const args: GetPrivateCoachingOrderReferenceIdByEmailArgs = { email };
    const result = await getPrivateCoachingOrderReferenceIdByEmail(
      this.pool,
      args,
    );
    return result;
  }

  // Set order invoice response. Safe for other than membership application
  async setOrderInvoiceResponse(
    referenceId: string,
    invoice: CreateInvoiceResponse,
  ) {
    const args: setOrderInvoiceResponseArgs = {
      content: JSON.stringify(invoice),
      refId: referenceId,
    };
    const result = await setOrderInvoiceResponse(this.pool, args);
    return result;
  }

  // Set order invoice request response. Safe for other than membership application
  async setOrderInvoiceRequestResponse(
    referenceId: string,
    invoice: CreateInvoiceResponse,
    request: CreateInvoiceRequest,
  ) {
    const args: setOrderInvoiceRequestResponseArgs = {
      content: JSON.stringify(invoice),
      refId: referenceId,
      request: JSON.stringify(request),
    };
    const result = await setOrderInvoiceRequestResponse(this.pool, args);
    return result;
  }

  // Get order and member by reference id. Tighly coupled with members table
  async getOrderAndMemberByReferenceId(
    referenceId: string,
  ): Promise<getOrderAndMemberByReferenceIdRow | null> {
    const args: getOrderAndMemberByReferenceIdArgs = { referenceId };
    const result = await getOrderAndMemberByReferenceId(this.pool, args);
    return result;
  }

  // get private coaching order by reference id
  async getOrderAndPrivateCoachingByReferenceId(
    referenceId: string,
  ): Promise<getOrderAndPrivateCoachingByReferenceIdRow | null> {
    const args: getOrderAndPrivateCoachingByReferenceIdArgs = { referenceId };
    const result = await getOrderAndPrivateCoachingByReferenceId(
      this.pool,
      args,
    );
    return result;
  }

  // Get payment methods. Safe for other than membership application
  async getPaymentMethods(amount: number): Promise<PaymentMethodsResponse> {
    const response = await firstValueFrom(
      this.httpService.post<PaymentMethodsResponse>(
        `${process.env.AUTH_API_URL}/v1/payment/methods`,
        {
          amount,
        },
        {
          headers: {
            'x-api-key': process.env.API_KEY,
          },
        },
      ),
    );
    return response.data;
  }

  // Get checkout data. Safe for other than membership application
  async getCheckoutData(
    referenceId: string,
    user: User,
  ): Promise<CheckoutResponse> {
    const order = await this.getOrderByReferenceId(referenceId);
    if (!order) {
      throw new Error('Order not found');
    }

    let invoice: CreateInvoiceResponse | null = null;
    if (
      (order as OrderWithInvoiceId)?.additionalInfo?.invoice_response?.data?.id
    ) {
      const createInvoiceResponse: CreateInvoiceResponse =
        await this.getInvoiceStatus(
          (order as OrderWithInvoiceId)?.additionalInfo?.invoice_response?.data
            ?.id,
          referenceId,
        );
      if (createInvoiceResponse.data.status === 'PAID') {
        invoice = createInvoiceResponse;
      }
    }

    const { orderPrice, paymentGatewayFee, tax, total } =
      this.calculatePaymentDetails(order, 0);
    const paymentMethods = await this.getPaymentMethods(total);

    return {
      user,
      referenceId,
      order,
      paymentMethods,
      membershipFee: orderPrice,
      paymentGatewayFee,
      tax,
      total,
      invoice,
    };
  }

  // Get checkout group data. Tighly coupled with membership calculation fee
  async getCheckoutGroupData(
    referenceId: string,
    user: User,
    potentialGroupData: getPotentialGroupDataRow[],
  ): Promise<CheckoutResponse> {
    const order = await this.getOrderByReferenceId(referenceId);
    if (!order) {
      throw new Error('Order not found');
    }

    let invoice: CreateInvoiceResponse | null = null;
    if (
      (order as OrderWithInvoiceId)?.additionalInfo?.invoice_response?.data?.id
    ) {
      const createInvoiceResponse: CreateInvoiceResponse =
        await this.getInvoiceStatus(
          (order as OrderWithInvoiceId)?.additionalInfo?.invoice_response?.data
            ?.id,
          referenceId,
        );
      if (createInvoiceResponse.data.status === 'PAID') {
        invoice = createInvoiceResponse;
      }
    }

    //above is agnostic, below is tightly coupled with membership calculation fee
    //translate potentialGroupData to MemberData
    const memberData: MemberData[] = potentialGroupData
      .filter((member) => member.checked)
      .map((member) => ({
        gender: (member.gender ?? 'female') as 'male' | 'female',
        duration: (member.duration ?? '360') as '90' | '180' | '360',
        email: member.email ?? '',
      }));

    const totalPrice =
      this.memberPricingService.calculateTotalPrice(memberData);

    order.price = String(totalPrice);

    const { orderPrice, paymentGatewayFee, tax, total } =
      this.calculatePaymentDetails(order, 0);
    const paymentMethods = await this.getPaymentMethods(total);

    return {
      user,
      referenceId,
      order,
      paymentMethods,
      membershipFee: orderPrice,
      paymentGatewayFee,
      tax,
      total,
      invoice,
    };
  }

  // Join to group. Safe for other than membership application
  async joinToGroup(mainReferenceId: string, partId: string) {
    const args: joinToGroupArgs = {
      mainReferenceId,
      partId: parseInt(partId),
    };
    const result = await joinToGroup(this.pool, args);
    return result;
  }

  // Remove from group. Safe for other than membership application
  async removeFromGroup(partId: string) {
    const args: removeFromGroupArgs = {
      partId: parseInt(partId),
    };
    const result = await removeFromGroup(this.pool, args);
    return result;
  }

  // Calculate payment details. Safe for other than membership application
  calculatePaymentDetails(order: any, paymentGatewayFee: number) {
    const orderPrice = parseFloat(
      (order as OrderWithAdditionalInfo)?.price.toString() || '0',
    );
    const taxRate = 0.1;
    const tax = orderPrice * taxRate;
    let total = orderPrice + tax;

    const priceDivisor = parseInt(process.env.PRICE_DIVISOR ?? '1');

    if ((order as OrderWithAdditionalInfo)?.additionalInfo?.cashback50) {
      total -= 50000 / priceDivisor;
    }
    if ((order as OrderWithAdditionalInfo)?.additionalInfo?.cashback100) {
      total -= 100000 / priceDivisor;
    }
    if ((order as OrderWithAdditionalInfo)?.additionalInfo?.cashback200) {
      total -= 200000 / priceDivisor;
    }

    const totalWithFee = total + paymentGatewayFee + this.darisiniFee;

    return {
      orderPrice,
      paymentGatewayFee,
      tax,
      total,
      totalWithFee,
    };
  }

  // process payment. Tighly coupled with membership calculation fee
  async processPayment(
    user: User,
    referenceId: string,
    paymentMethod: string,
    paymentGatewayFee: number,
  ) {
    const order: getOrderAndMemberByReferenceIdRow | null =
      await this.getOrderAndMemberByReferenceId(referenceId); //here this tightly coupled part, part 1 of 2
    if (!order) {
      throw new Error('Order not found');
    }
    const paymentDetails = this.calculatePaymentDetails(
      order,
      paymentGatewayFee,
    );

    const url = process.env.ME_API_URL || 'https://whygym.mvp.my.id';

    // here is tightly coupled part 2 of 2
    const request = new CreateInvoiceRequest(
      referenceId,
      url,
      user.email,
      order.additionalData,
      paymentDetails.total,
      user.fullName,
      order.phoneNumber || '',
      paymentMethod,
    );

    const invoice = await this.postCreateInvoice(request);
    await this.setOrderInvoiceRequestResponse(referenceId, invoice, request);

    const retval = {
      user,
      referenceId: referenceId,
      memberId: order?.memberId,
      ...paymentDetails,
      order,
      paymentMethod,
    };

    return retval;
  }

  // process group payment. Tighly coupled with membership calculation fee
  async processPaymentGroup(
    user: User,
    referenceId: string,
    paymentMethod: string,
    paymentGatewayFee: number,
    potentialGroupData: getPotentialGroupDataRow[],
  ) {
    const order: getOrderAndMemberByReferenceIdRow | null =
      await this.getOrderAndMemberByReferenceId(referenceId); //here this tightly coupled part, 1 of 3
    if (!order) {
      throw new Error('Order not found');
    }

    // start of tightly coupled part 2 of 3
    const memberData: MemberData[] = potentialGroupData
      .filter((member) => member.checked)
      .map((member) => ({
        gender: (member.gender ?? 'female') as 'male' | 'female',
        duration: (member.duration ?? '360') as '90' | '180' | '360',
        email: member.email ?? '',
      }));

    const totalPrice =
      this.memberPricingService.calculateTotalPrice(memberData);

    order.price = String(totalPrice);
    // end of tightly coupled part 2 of 3

    const paymentDetails = this.calculatePaymentDetails(
      order,
      paymentGatewayFee,
    );

    const url = process.env.ME_API_URL || 'https://whygym.mvp.my.id';
    // here is tightly coupled part 3 of 3
    const request = new CreateInvoiceRequest(
      referenceId,
      url,
      user.email,
      order.additionalData,
      paymentDetails.total,
      user.fullName,
      order.phoneNumber || '',
      paymentMethod,
    );

    const invoice = await this.postCreateInvoice(request);
    await this.setOrderInvoiceRequestResponse(referenceId, invoice, request);

    const retval = {
      user,
      referenceId: referenceId,
      memberId: order?.memberId,
      ...paymentDetails,
      order,
      paymentMethod,
    };

    return retval;
  }

  // process payment. Tighly coupled with membership calculation fee
  async processPaymentPrivateCoachingFee(
    user: User,
    referenceId: string,
    paymentMethod: string,
    paymentGatewayFee: number,
  ) {
    const order: getOrderAndPrivateCoachingByReferenceIdRow | null =
      await this.getOrderAndPrivateCoachingByReferenceId(referenceId);
    if (!order) {
      throw new Error('Order not found');
    }
    const paymentDetails = this.calculatePaymentDetails(
      order,
      paymentGatewayFee,
    );

    const memberData = await this.membersService.getMemberById(
      order.memberId ?? 0,
    );

    const url = process.env.ME_API_URL || 'https://whygym.mvp.my.id';

    const request = CreateInvoiceRequest.createPrivateCoachingFeeInvoiceRequest(
      referenceId,
      url,
      user.email,
      order.additionalData,
      paymentDetails.total,
      memberData?.nickname ?? '',
      memberData?.phoneNumber ?? '',
      paymentMethod,
      (order as OrderPrivateCoachingFeeData).additionalData.coachType,
      (order as OrderPrivateCoachingFeeData).additionalData.sessionCount,
    );

    const invoice = await this.postCreateInvoice(request);
    await this.setOrderInvoiceRequestResponse(referenceId, invoice, request);

    const retval = {
      user,
      referenceId: referenceId,
      memberId: order?.memberId,
      ...paymentDetails,
      order,
      paymentMethod,
    };

    return retval;
  }

  // post create invoice. Safe for other than membership application
  async postCreateInvoice(
    request: CreateInvoiceRequest,
  ): Promise<CreateInvoiceResponse> {
    const response = await firstValueFrom(
      this.httpService.post<CreateInvoiceResponse>(
        `${process.env.AUTH_API_URL}/v1/marketplace/invoices/create`,
        request,
        {
          headers: {
            'x-api-key': process.env.API_KEY,
          },
        },
      ),
    );
    return response.data;
  }

  // get invoice status. Safe for other than membership application
  async getInvoiceStatus(
    invoiceId: string,
    referenceId: string,
  ): Promise<CreateInvoiceResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<CreateInvoiceResponse>(
          `${process.env.AUTH_API_URL}/v1/marketplace/invoices/${invoiceId}`,
          {
            headers: {
              'x-api-key': process.env.API_KEY,
            },
          },
        ),
      );

      await this.setOrderInvoiceResponse(referenceId, response.data);

      return response.data;
    } catch (error) {
      console.error('Error getting invoice status:', error);
      throw error;
    }
  }

  // post payment process. Safe for other than membership application
  async postPaymentProcess(amount: number): Promise<PaymentMethodsResponse> {
    const response = await firstValueFrom(
      this.httpService.post<PaymentMethodsResponse>(
        `${process.env.AUTH_API_URL}/v1/payment/methods`,
        {
          amount,
        },
        {
          headers: {
            'x-api-key': process.env.API_KEY,
          },
        },
      ),
    );
    return response.data;
  }

  // insert order status log. Safe for other than membership application
  async insertOrderStatusLog(referenceId: string, orderStatus: string) {
    const args: insertOrderStatusLogArgs = {
      referenceId,
      orderStatus,
      notes: null,
      additionalInfo: null,
    };
    const result = await insertOrderStatusLog(this.pool, args);
    return result;
  }

  // set invoice status response and activate membership. Tighly coupled with membership calculation fee
  async setInvoiceStatusResponseAndActivateMembership(referenceId: string) {
    const order = await this.getOrderAndMemberByReferenceId(referenceId); //here this tightly coupled part, 1 of 2
    if (!order) {
      throw new Error('Order not found');
    }
    // here is tightly coupled part 2 of 2
    const createInvoiceResponse: CreateInvoiceResponse =
      await this.getInvoiceStatus(
        (order as OrderWithInvoiceId)?.additionalInfo?.invoice_response?.data
          ?.id,
        referenceId,
      );

    if (createInvoiceResponse.data.status === 'PAID') {
      const args: setInvoiceStatusResponseAndActivateMembershipArgs = {
        mainReferenceId: referenceId,
        invoiceStatusResponse: createInvoiceResponse,
      };

      // here is tightly coupled part 3 of 3. the ultimate tightly coupled part
      const result = await setInvoiceStatusResponseAndActivateMembership(
        this.pool,
        args,
      );
      return result;
    }
  }

  // set invoice status response and activate private coaching
  async setInvoiceStatusResponseAndActivatePrivateCoaching(
    referenceId: string,
  ) {
    const order =
      await this.getOrderAndPrivateCoachingByReferenceId(referenceId);
    if (!order) {
      throw new Error('Order not found');
    }

    const createInvoiceResponse: CreateInvoiceResponse =
      await this.getInvoiceStatus(
        (order as OrderWithInvoiceId)?.additionalInfo?.invoice_response?.data
          ?.id,
        referenceId,
      );

    if (createInvoiceResponse.data.status === 'PAID') {
      const args: setInvoiceStatusResponseAndActivatePrivateCoachingArgs = {
        referenceId: referenceId,
        invoiceStatusResponse: createInvoiceResponse,
      };

      // here is tightly coupled part 3 of 3. the ultimate tightly coupled part
      const result = await setInvoiceStatusResponseAndActivatePrivateCoaching(
        this.pool,
        args,
      );
      return result;
    }
  }

  // get payment url by reference id. Safe for other than membership application
  async getPaymentUrlByReferenceId(referenceId: string) {
    const args: getPaymentUrlByReferenceIdArgs = { referenceId };
    const result: getPaymentUrlByReferenceIdRow | null =
      await getPaymentUrlByReferenceId(this.pool, args);
    if (!result) {
      throw new Error('Payment URL not found');
    }
    return result?.paymenturl || '';
  }

  // Get coaching checkout data
  async getCoachingCheckoutData(
    referenceId: string,
    user: User,
  ): Promise<CheckoutResponse> {
    const order = await this.getOrderByReferenceId(referenceId);
    if (!order) {
      throw new Error('Order not found');
    }

    let invoice: CreateInvoiceResponse | null = null;
    if (
      (order as OrderWithInvoiceId)?.additionalInfo?.invoice_response?.data?.id
    ) {
      const createInvoiceResponse: CreateInvoiceResponse =
        await this.getInvoiceStatus(
          (order as OrderWithInvoiceId)?.additionalInfo?.invoice_response?.data
            ?.id,
          referenceId,
        );
      if (createInvoiceResponse.data.status === 'PAID') {
        invoice = createInvoiceResponse;
      }
    }

    const { orderPrice, paymentGatewayFee, tax, total } =
      this.calculatePaymentDetails(order, 0);
    const paymentMethods = await this.getPaymentMethods(total);

    return {
      user,
      referenceId,
      order,
      paymentMethods,
      membershipFee: orderPrice,
      paymentGatewayFee,
      tax,
      total,
      invoice,
    };
  }
}
