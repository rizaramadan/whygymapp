import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import {
  getWaitingPaymentOrders,
  getWaitingPaymentOrdersRow,
  turnOffCashback100,
  turnOffCashback200,
  turnOffCashback50,
  turnOffExtend15,
  turnOffExtend30,
  turnOffExtend60,
  turnOnCashback100,
  turnOnCashback200,
  turnOnCashback50,
  turnOnExtend15,
  turnOnExtend30,
  turnOnExtend60,
  getConfig,
  getPendingExtensionOrders,
  getPendingExtensionOrdersRow,
  getCheckExtensionOrder,
  setVoucherGiven,
} from 'db/src/query_sql';
import { addFoExtensionOrder, addFoExtensionOrderRow } from 'db/volatile/fo/fo-query_sql';


@Injectable()
export class FoService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async getWaitingPaymentOrders(): Promise<getWaitingPaymentOrdersRow[]> {
    return await getWaitingPaymentOrders(this.pool);
  }

  async extend15(referenceId: string, toggle: boolean) {
    if (toggle) {
      return await turnOnExtend15(this.pool, { referenceId });
    } else {
      return await turnOffExtend15(this.pool, { referenceId });
    }
  }

  async extend30(referenceId: string, toggle: boolean) {
    if (toggle) {
      return await turnOnExtend30(this.pool, { referenceId });
    } else {
      return await turnOffExtend30(this.pool, { referenceId });
    }
  }

  async extend60(referenceId: string, toggle: boolean) {
    if (toggle) {
      return await turnOnExtend60(this.pool, { referenceId });
    } else {
      return await turnOffExtend60(this.pool, { referenceId });
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

  async cashback50(referenceId: string, toggle: boolean) {
    if (toggle) {
      return await turnOnCashback50(this.pool, { referenceId });
    } else {
      return await turnOffCashback50(this.pool, { referenceId });
    }
  }

  async getCheckExpireDate(): Promise<boolean> {
    const config = await getConfig(this.pool, {
      key: 'getCheckExpireDate',
    });
    return config?.valueBoolean ?? true; //default is true
  }

  async getPendingExtensionOrders(): Promise<getPendingExtensionOrdersRow[]> {
    return await getPendingExtensionOrders(this.pool);
  }

  async addFoExtensionOrder(orderId: number, logId: number, frontOfficer: string): Promise<string | null> {
    const order = await getCheckExtensionOrder(this.pool, { id: logId });
    if (!order) {
      return null;
    }
    const fo = `"${frontOfficer}"`;
    await addFoExtensionOrder(this.pool, { id: orderId, frontOfficer: fo });
    return order.paymentUrl;
  }

  async setVoucherGiven(memberId: number) {
    const response = await setVoucherGiven(this.pool, { id: memberId });
    return response;
  }
}
