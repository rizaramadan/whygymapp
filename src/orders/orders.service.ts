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
  setOrderInvoiceResponseArgs,
  setOrderInvoiceResponse,
  setInvoiceStatusResponseAndActivateMembershipArgs,
  setInvoiceStatusResponseAndActivateMembership,
  getPaymentUrlByReferenceIdArgs,
  getPaymentUrlByReferenceId,
  getPaymentUrlByReferenceIdRow,
  getPotentialGroupDataRow,
} from '../../db/src/query_sql';
import {
  CheckoutResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  PaymentMethodsResponse,
} from './orders.interfaces';
import { User } from '../users/users.service';
import { MembersService } from 'src/members/members.service';
interface OrderWithAdditionalInfo {
  additionalInfo: {
    cashback100: boolean;
    cashback200: boolean;
  };
  price: number;
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

@Injectable()
export class OrdersService {
  private readonly darisiniFee = 0;

  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private readonly httpService: HttpService,
  ) {}

  async getOrderByReferenceId(
    referenceId: string,
  ): Promise<getOrderByReferenceIdRow | null> {
    const args: getOrderByReferenceIdArgs = { referenceId };
    const result = await getOrderByReferenceId(this.pool, args);
    return result;
  }

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

  async getOrderAndMemberByReferenceId(
    referenceId: string,
  ): Promise<getOrderAndMemberByReferenceIdRow | null> {
    const args: getOrderAndMemberByReferenceIdArgs = { referenceId };
    const result = await getOrderAndMemberByReferenceId(this.pool, args);
    return result;
  }

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

    const { membershipFee, paymentGatewayFee, tax, total } =
      this.calculatePaymentDetails(order, 0);
    const paymentMethods = await this.getPaymentMethods(total);

    return {
      user,
      referenceId,
      order,
      paymentMethods,
      membershipFee,
      paymentGatewayFee,
      tax,
      total,
      invoice,
    };
  }

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

    const priceType = 'normal';
    //get price from potentialGroupData, gender and duration from there, and then calculate the total price, in iterate with map
    const totalPrice = potentialGroupData
      .filter((member) => member.checked)
      .reduce((acc, curr) => {
        const gender = curr.gender || 'male';
        const duration = curr.duration || '90';
        if (!MembersService.priceMap[priceType]?.[gender]?.[duration]) {
          throw new Error('Invalid price parameters');
        }

        const price = String(
          MembersService.priceMap[priceType][gender][duration],
        );
        return acc + parseFloat(price);
      }, 0);

    order.price = String(totalPrice);

    const { membershipFee, paymentGatewayFee, tax, total } =
      this.calculatePaymentDetails(order, 0);
    const paymentMethods = await this.getPaymentMethods(total);

    return {
      user,
      referenceId,
      order,
      paymentMethods,
      membershipFee,
      paymentGatewayFee,
      tax,
      total,
      invoice,
    };
  }

  calculatePaymentDetails(order: any, paymentGatewayFee: number) {
    const membershipFee = parseFloat(
      (order as OrderWithAdditionalInfo)?.price.toString() || '0',
    );
    const taxRate = 0.11;
    const tax = membershipFee * taxRate;
    let total = membershipFee + tax;

    if ((order as OrderWithAdditionalInfo)?.additionalInfo?.cashback100) {
      total -= 100000;
    }
    if ((order as OrderWithAdditionalInfo)?.additionalInfo?.cashback200) {
      total -= 200000;
    }

    const totalWithFee = total + paymentGatewayFee + this.darisiniFee;

    return {
      membershipFee,
      paymentGatewayFee,
      tax,
      total,
      totalWithFee,
    };
  }

  async processPayment(
    user: User,
    referenceId: string,
    paymentMethod: string,
    paymentGatewayFee: number,
  ) {
    const order: getOrderAndMemberByReferenceIdRow | null =
      await this.getOrderAndMemberByReferenceId(referenceId);
    if (!order) {
      throw new Error('Order not found');
    }
    const paymentDetails = this.calculatePaymentDetails(
      order,
      paymentGatewayFee,
    );

    const url = process.env.ME_API_URL || 'https://whygym.mvp.my.id';
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
    await this.setOrderInvoiceResponse(referenceId, invoice);

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

  async setInvoiceStatusResponseAndActivateMembership(referenceId: string) {
    const order = await this.getOrderAndMemberByReferenceId(referenceId);
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
      const args: setInvoiceStatusResponseAndActivateMembershipArgs = {
        mainReferenceId: referenceId,
        invoiceStatusResponse: createInvoiceResponse,
      };
      const result = await setInvoiceStatusResponseAndActivateMembership(
        this.pool,
        args,
      );
      return result;
    }
  }

  async getPaymentUrlByReferenceId(referenceId: string) {
    const args: getPaymentUrlByReferenceIdArgs = { referenceId };
    const result: getPaymentUrlByReferenceIdRow | null =
      await getPaymentUrlByReferenceId(this.pool, args);
    if (!result) {
      throw new Error('Payment URL not found');
    }
    return result?.paymenturl || '';
  }
}
