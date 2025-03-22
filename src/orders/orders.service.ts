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
} from '../../db/src/query_sql';
import {
  CheckoutResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  PaymentMethodsResponse,
} from './orders.interfaces';
import { User } from '../users/users.service';
interface OrderWithAdditionalInfo {
  additionalInfo: {
    cashback100: boolean;
    cashback200: boolean;
  };
  price: number;
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

    total = total + paymentGatewayFee + this.darisiniFee;

    return {
      membershipFee,
      paymentGatewayFee,
      tax,
      total,
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
}
