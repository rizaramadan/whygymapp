import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import {
  getWaitingPaymentOrders,
  getWaitingPaymentOrdersRow,
  turnOffCashback100,
  turnOffCashback200,
  turnOffExtend30,
  turnOffExtend90,
  turnOnCashback100,
  turnOnCashback200,
  turnOnExtend30,
  turnOnExtend90,
} from 'db/src/query_sql';

@Injectable()
export class FoService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async getWaitingPaymentOrders(): Promise<getWaitingPaymentOrdersRow[]> {
    return await getWaitingPaymentOrders(this.pool);
  }

  async extend30(referenceId: string, toggle: boolean) {
    if (toggle) {
      return await turnOnExtend30(this.pool, { referenceId });
    } else {
      return await turnOffExtend30(this.pool, { referenceId });
    }
  }

  async extend90(referenceId: string, toggle: boolean) {
    if (toggle) {
      return await turnOnExtend90(this.pool, { referenceId });
    } else {
      return await turnOffExtend90(this.pool, { referenceId });
    }
  }

  async cashback100(referenceId: string, toggle: boolean) {
    if (toggle) {
      return await turnOnCashback100(this.pool, { referenceId });
    } else {
      return await turnOffCashback100(this.pool, { referenceId });
    }
  }

  async cashback200(referenceId: string, toggle: boolean) {
    if (toggle) {
      return await turnOnCashback200(this.pool, { referenceId });
    } else {
      return await turnOffCashback200(this.pool, { referenceId });
    }
  }
}
