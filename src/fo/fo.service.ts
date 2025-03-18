import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import {
  getWaitingPaymentOrders,
  getWaitingPaymentOrdersRow,
} from 'db/src/query_sql';

@Injectable()
export class FoService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async getWaitingPaymentOrders(): Promise<getWaitingPaymentOrdersRow[]> {
    return await getWaitingPaymentOrders(this.pool);
  }

  async giveCashback(referenceId: string): Promise<void> {
    // TODO: Implement the database query to update order status to CASHBACK
    await this.pool.query(
      'UPDATE orders SET order_status = $1 WHERE reference_id = $2',
      ['CASHBACK', referenceId]
    );
  }

  async extendMembership(referenceId: string): Promise<void> {
    // TODO: Implement the database query to update order status to EXTENDED
    await this.pool.query(
      'UPDATE orders SET order_status = $1 WHERE reference_id = $2',
      ['EXTENDED', referenceId]
    );
  }
}
