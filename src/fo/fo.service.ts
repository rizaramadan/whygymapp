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
}
