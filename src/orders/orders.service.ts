import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class OrdersService {
  private readonly darisiniFee = 3500;

  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async getOrderByReferenceId(referenceId: string) {
    const result = await this.pool.query(
      'SELECT * FROM whygym.orders WHERE reference_id = $1',
      [referenceId],
    );
    return result.rows[0];
  }

  async getPaymentMethods(amount: number) {
    // Mock payment method data
    return {
      paymentMethod: {
        paymentGatewayFee: 4000,
      },
    };
  }

  calculatePaymentDetails(order: any, paymentMethod: any) {
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

    const paymentGatewayFee =
      (paymentMethod?.paymentGatewayFee || 0) + this.darisiniFee;
    total = total + paymentGatewayFee;

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
