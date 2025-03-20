import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  getOrderByReferenceId,
  getOrderByReferenceIdArgs,
  getOrderByReferenceIdRow,
} from '../../db/src/query_sql';

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

  async getPaymentMethods(amount: number) {
    const response = await firstValueFrom(
      this.httpService.post(
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

  calculatePaymentDetails(order: any,paymentGatewayFee: number) {
    const membershipFee = parseFloat(order?.price || '0');
    const taxRate = 0.11;
    const tax = membershipFee * taxRate;
    let total = membershipFee + tax;

    if (order?.additionalInfo?.cashback100) {
      total -= 100000;  
    }
    if (order?.additionalInfo?.cashback200) {
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

  getPaymentOptions() {
    return [
      { id: 'va', name: 'Virtual Account' },
      { id: 'qris', name: 'QRIS' },
    ];
  }
}
