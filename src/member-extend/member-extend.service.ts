import { Injectable, Inject } from '@nestjs/common';
import { getMemberActiveDateRow, 
  createExtensionOrder, 
  getExtensionOrder, 
  insertExtensionOrderStatusLog, 
  getExtensionInvoiceIdByReferenceId, 
  addExtraTime, 
  getPaidPaymentInvoiceResponseByReferenceId, 
  setExtensionOrderStatus,
  getExtensionOrderExtraTime,
  getExtensionOrderExtraTimeRow
} from '../../db/src/query_sql';
import { OrdersService } from '../orders/orders.service';
import { CreateInvoiceRequest, PaymentMethodsResponse } from '../orders/orders.interfaces';
import { MembersService } from '../members/members.service';
import { Pool } from 'pg';

export interface MemberData {
  id: number;
  email: string;
  nickname: string;
  membershipStatus: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  daysRemaining: number;
  gender: string;
}

export interface ExtensionOption {
  duration: number; // in days
  label: string;
  price: number;
  discountedPrice?: number;
  savings?: number;
  newExpirationDate: Date;
}

export interface CheckoutData {
  member: MemberData;
  selectedExtension: ExtensionOption;
  subtotal: number;
  tax: number;
  total: number;
  currentExpiration: Date;
  newExpiration: Date;
}

@Injectable()
export class MemberExtendService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private readonly orderService: OrdersService,
    private readonly memberService: MembersService
  ) {}

  //parseInt(process.env.PRICE_DIVISOR ?? '1')
  private static mapPrice = {
    'male': {
        '90': 740000,
        '180': 1440000,
        '360': 2440000
    },
    'female': {
        '90': 1150000,
        '180': 2230000,
        '360': 4100000
    }
  }
      
    private static mapExtension = {
          '90': [90, 30],
          '180': [180, 30, 60],
          '360': [360, 60, 90]
      }

  async getMemberDataForExtension(email: string): Promise<MemberData | null> {
    // Static data for testing - in real implementation, this would query the database
    const memberData = await this.memberService.getMemberIdByEmail(email);
    if (!memberData) {
      return null;
    }

    const returnMemberData: MemberData = {
      id: 1,
      email: email,
      nickname: memberData.nickname,
      membershipStatus: memberData.membershipStatus,
      startDate: memberData.additionalData?.startDate,
      endDate: memberData.additionalData?.endDate,
      duration: memberData.additionalData?.duration,
      daysRemaining: memberData.additionalData?.daysRemaining,
      gender: memberData.additionalData?.gender
    };
    
    // Only return data if member has active status
    if (returnMemberData.membershipStatus !== 'active') {
      return null;
    }
    
    return returnMemberData;
  }

  async getExtensionOptions(memberData: { endDate: Date, gender: string }): Promise<ExtensionOption[]> {
    const baseDate = memberData.endDate;
    const gender = memberData.gender;
     
    return [
      {
        duration: 90,   
        label: '3 bulan',
        price:  MemberExtendService.mapPrice[gender]['90'] / parseInt(process.env.PRICE_DIVISOR ?? '1'),
        newExpirationDate: new Date(baseDate.getTime() + MemberExtendService.mapExtension['90'].reduce((sum, days) => sum + days, 0) * 24 * 60 * 60 * 1000)
      },
      {
        duration: 180,
        label: '6 bulan',
        price: MemberExtendService.mapPrice[gender]['180'] / parseInt(process.env.PRICE_DIVISOR ?? '1'),
        newExpirationDate: new Date(baseDate.getTime() + MemberExtendService.mapExtension['180'].reduce((sum, days) => sum + days, 0) * 24 * 60 * 60 * 1000)
      },
      {
        duration: 360,
        label: '1 tahun',
        price: MemberExtendService.mapPrice[gender]['360'] / parseInt(process.env.PRICE_DIVISOR ?? '1'),
        newExpirationDate: new Date(baseDate.getTime() + MemberExtendService.mapExtension['360'].reduce((sum, days) => sum + days, 0) * 24 * 60 * 60 * 1000)
      }
    ];
  }

  async createExtensionOrder(email: string, memberData: MemberData, duration: number): Promise<string> {
    // Generate a reference ID for the extension order
    
    // Create the order in the database
    const order = await createExtensionOrder(this.pool, {
      memberId: memberData.id,
      memberEmail: email,
      durationDays: duration
    });

    if (!order) {
      throw new Error('Failed to create extension order');
    }
    
    return order.referenceId;
  }

  async getCheckoutData(referenceId: string, email: string, memberActiveDate: getMemberActiveDateRow): Promise<CheckoutData | null> {
    const memberData = await this.getMemberDataForExtension(email);
    if (!memberData) return null;

    // Extract duration from reference ID or fetch from database
    // For static data, let's assume 180 days extension
    const extensionOptions = await this.getExtensionOptions({ endDate: memberActiveDate.endDate, gender: memberData.gender });

    const extensionOrder = await getExtensionOrder(this.pool, { referenceId: referenceId });
    const selectedExtension = extensionOptions.find(option => `${option.duration}` === `${extensionOrder?.durationDays || '90'}`)
      || extensionOptions[0];
    
    const subtotal = selectedExtension.price;
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const total = subtotal + tax;

    return {
      member: memberData,
      selectedExtension,
      subtotal,
      tax,
      total,
      currentExpiration: memberData.endDate,
      newExpiration: selectedExtension.newExpirationDate
    };
  }

  async getPaymentMethods(total: number): Promise<PaymentMethodsResponse> {
    // Static payment methods data similar to the existing checkout
    return this.orderService.getPaymentMethods(total);
  }

  async processPayment(fullName: string, referenceId: string, paymentMethod: string, total: number): Promise<any> {
    const extensionOrder = await getExtensionOrder(this.pool, { referenceId: referenceId });
    if (!extensionOrder) {
      throw new Error('Extension order not found');
    }
    const url = process.env.ME_API_URL || 'https://whygym.mvp.my.id';

    // here is tightly coupled part 2 of 2
    const request = CreateInvoiceRequest.createExtensionOrderInvoiceRequest(
      referenceId,
      url,
      extensionOrder.memberEmail,
      fullName,
      paymentMethod,
      extensionOrder.durationDays,
      parseFloat(total.toString())
    );

    await insertExtensionOrderStatusLog(this.pool, {
      referenceId: referenceId,
      extensionOrderStatus: 'process-payment-request',
      notes: 'Payment invoice request',
      additionalInfo: {
        request: request
      }
    });

    const invoice = await this.orderService.postCreateInvoice(request);
    await insertExtensionOrderStatusLog(this.pool, {
      referenceId: referenceId,
      extensionOrderStatus: 'process-payment-response',
      notes: 'Payment invoice response',
      additionalInfo: {
        response: invoice
      }
    });

    return invoice;
  }


  async getCurrentInvoiceData(referenceId: string): Promise<any> {
    const invoice = await getExtensionInvoiceIdByReferenceId(this.pool, { referenceId: referenceId });
    if (!invoice) {
      throw new Error('Invoice ID not found');
    }

    const paidInvoice = await getPaidPaymentInvoiceResponseByReferenceId(this.pool, { referenceId: referenceId });
    if (paidInvoice) {
      return {
        invoiceData: paidInvoice
      };
    }

    const invoiceStatus = await this.orderService.getInvoiceStatusNoSave(invoice.invoiceId || '');
    await insertExtensionOrderStatusLog(this.pool, {
      referenceId: referenceId,
      extensionOrderStatus: 'get-payment-invoice-response',
      notes: 'Get payment invoice response',
      additionalInfo: {
        response: invoiceStatus
      }
    });

    if (invoiceStatus.data.status === 'PAID') {
      const extensionOrder = await getExtensionOrder(this.pool, { referenceId: referenceId });
      if (!extensionOrder) {
        throw new Error('Extension order not found (wait what?)');
      }

      await setExtensionOrderStatus(this.pool, {
        referenceId: referenceId,
        status: 'paid'
      });

      const expireDate = await this.isMemberExpired(extensionOrder.memberId);
      const isMemberExpire = expireDate < new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

      if(isMemberExpire) {
        //since member is expired, add extra time since expired to today's date
        //diff expireDate and today's date
        const diff = new Date().getTime() - expireDate.getTime();
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        await addExtraTime(this.pool, {
          memberId: extensionOrder.memberId,
          extraTime: diffDays,
          reason: `gap filling ${diffDays} days`,
          orderReferenceId: referenceId,
          createdBy: extensionOrder.memberId
        });
      }

      await addExtraTime(this.pool, {
        memberId: extensionOrder.memberId,
        extraTime: extensionOrder.durationDays,
        reason: `Extension order (${extensionOrder.durationDays} days)`,
        orderReferenceId: referenceId,
        createdBy: extensionOrder.memberId
      });
        
      switch (extensionOrder.durationDays) {
        case 90:
          if(!isMemberExpire) {
            await addExtraTime(this.pool, {
              memberId: extensionOrder.memberId,
              extraTime: 30,
              reason: `EXTRA 30 days from Extension order (${extensionOrder.durationDays} days)`,
              orderReferenceId: referenceId,
              createdBy: extensionOrder.memberId
            });
          }
          break;
        case 180:
          await addExtraTime(this.pool, {
            memberId: extensionOrder.memberId,
            extraTime: 30,
            reason: `EXTRA 30 days from Extension order (${extensionOrder.durationDays} days)`,
            orderReferenceId: referenceId,
            createdBy: extensionOrder.memberId
          });

          if(!isMemberExpire) {
            await addExtraTime(this.pool, {
              memberId: extensionOrder.memberId,
              extraTime: 60,
              reason: `EXTRA 60 days from Extension order (${extensionOrder.durationDays} days)`,
              orderReferenceId: referenceId,
              createdBy: extensionOrder.memberId
            });
          }
          break;
        case 360:
          await addExtraTime(this.pool, {
            memberId: extensionOrder.memberId,
            extraTime: 30,
            reason: `EXTRA 30 days from Extension order (${extensionOrder.durationDays} days)`,
            orderReferenceId: referenceId,
            createdBy: extensionOrder.memberId
          });
          
          if(!isMemberExpire) {
            await addExtraTime(this.pool, {
              memberId: extensionOrder.memberId,
              extraTime: 90,
              reason: `EXTRA 90 days from Extension order (${extensionOrder.durationDays} days)`,
              orderReferenceId: referenceId,
              createdBy: extensionOrder.memberId
            });
          }
          break;
      }
    }
    
    return invoiceStatus;
  }


  async isMemberExpired(memberId: number): Promise<Date> {
    const member = await this.memberService.getMemberById(memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    const duration = await this.memberService.getMemberDurationData(member.id);
    let expireDate = member.startDate || new Date();
    expireDate.setDate(expireDate.getDate() + duration + 1);
    return expireDate;
  }

  async handlePaymentSuccess(referenceId: string): Promise<any> {
    // Static success data
    return {
      success: true,
      message: 'Payment successful! Your membership has been extended.',
      extensionDetails: {
        duration: '180 days',
        newExpirationDate: new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)),
        transactionId: `TXN-${Date.now()}`,
        receiptUrl: `/member-extend/receipt/${referenceId}`
      }
    };
  }

  async handlePaymentFailure(referenceId: string): Promise<any> {
    return {
      success: false,
      message: 'Payment failed. Please try again or contact support.',
      referenceId,
      supportContact: 'gymmin.whygym@gmail.com'
    };
  }

  async handlePaymentCallback(callbackData: any): Promise<any> {
    console.log('Payment callback received:', callbackData);
    
    // In real implementation, this would:
    // 1. Validate the callback authenticity
    // 2. Update the order status
    // 3. Update member's expiration date if payment successful
    // 4. Send confirmation email
    
    return { status: 'received' };
  }

  private async getTotalAmount(referenceId: string): Promise<number> {
    // Static amount calculation
    return 1320000; // 1,200,000 + 120,000 tax
  }

  private getPaymentInstructions(paymentMethod: string): string[] {
    const instructions = {
      'QRIS': [
        'Open your preferred e-wallet app',
        'Scan the QR code displayed',
        'Confirm the payment amount',
        'Complete the transaction'
      ],
      'GOPAY': [
        'Open your GoPay app',
        'Enter the payment code',
        'Confirm the payment',
        'Complete the transaction'
      ],
      'OVO': [
        'Open your OVO app',
        'Go to Pay/Transfer menu',
        'Enter the payment code',
        'Complete the payment'
      ],
      'DANA': [
        'Open your DANA app',
        'Scan QR or enter payment code',
        'Confirm the amount',
        'Complete the transaction'
      ],
      'BCA': [
        'Transfer to the virtual account number',
        'Amount must match exactly',
        'Use your registered name',
        'Keep the transfer receipt'
      ],
      'MANDIRI': [
        'Transfer to the virtual account number',
        'Amount must match exactly',
        'Use your registered name',
        'Keep the transfer receipt'
      ]
    };

    return instructions[paymentMethod] || ['Follow the payment instructions provided'];
  }

  async getExtensionOrderExtraTime() : Promise<getExtensionOrderExtraTimeRow[]>{
    const extensionOrderExtraTime = await getExtensionOrderExtraTime(this.pool);
    return extensionOrderExtraTime;
  }
}
