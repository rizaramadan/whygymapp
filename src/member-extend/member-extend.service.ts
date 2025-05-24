import { Injectable } from '@nestjs/common';

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
    const staticMemberData: MemberData = {
      id: 1,
      email: email,
      nickname: 'John Doe',
      membershipStatus: 'active',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-04-15'), // 90 days from now
      duration: 360,
      daysRemaining: 90,
      gender: 'male'
    };
    
    // Only return data if member has active status
    if (staticMemberData.membershipStatus !== 'active') {
      return null;
    }
    
    return staticMemberData;
  }

  async getExtensionOptions(memberData: { endDate: Date, gender: string }): Promise<ExtensionOption[]> {
    const baseDate = memberData.endDate;
    const gender = memberData.gender;
     
    return [
      {
        duration: 90,   
        label: '3 bulan',
        price:  MemberExtendService.mapPrice[gender]['90'],
        newExpirationDate: new Date(baseDate.getTime() + MemberExtendService.mapExtension['90'].reduce((sum, days) => sum + days, 0) * 24 * 60 * 60 * 1000)
      },
      {
        duration: 180,
        label: '6 bulan',
        price: MemberExtendService.mapPrice[gender]['180'],
        newExpirationDate: new Date(baseDate.getTime() + MemberExtendService.mapExtension['180'].reduce((sum, days) => sum + days, 0) * 24 * 60 * 60 * 1000)
      },
      {
        duration: 360,
        label: '1 tahun',
        price: MemberExtendService.mapPrice[gender]['360'],
        newExpirationDate: new Date(baseDate.getTime() + MemberExtendService.mapExtension['360'].reduce((sum, days) => sum + days, 0) * 24 * 60 * 60 * 1000)
      }
    ];
  }

  async createExtensionOrder(email: string, duration: number): Promise<string> {
    // Generate a reference ID for the extension order
    const referenceId = `EXT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    // In real implementation, this would create an order record in the database
    console.log(`Creating extension order for ${email}, duration: ${duration} days, reference: ${referenceId}`);
    
    return referenceId;
  }

  async getCheckoutData(referenceId: string, email: string): Promise<CheckoutData | null> {
    const memberData = await this.getMemberDataForExtension(email);
    if (!memberData) return null;

    // Extract duration from reference ID or fetch from database
    // For static data, let's assume 180 days extension
    const extensionOptions = await this.getExtensionOptions({ endDate: memberData.endDate, gender: memberData.gender });
    const selectedExtension = extensionOptions[1]; // 180 days option
    
    const subtotal = selectedExtension.discountedPrice || selectedExtension.price;
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

  async getPaymentMethods(): Promise<any> {
    // Static payment methods data similar to the existing checkout
    return {
      data: [
        {
          code: 'QRIS',
          name: 'QRIS',
          method: 'QR_CODE',
          status: 'ACTIVE',
          paymentGatewayFee: 2500,
          logo: {
            url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/qr/qr-original.svg'
          }
        },
        {
          code: 'GOPAY',
          name: 'GoPay',
          method: 'E_WALLET',
          status: 'ACTIVE',
          paymentGatewayFee: 1500,
          logo: {
            url: 'https://seeklogo.com/images/G/gopay-logo-D62E2BE504-seeklogo.com.png'
          }
        },
        {
          code: 'OVO',
          name: 'OVO',
          method: 'E_WALLET',
          status: 'ACTIVE',
          paymentGatewayFee: 1500,
          logo: {
            url: 'https://seeklogo.com/images/O/ovo-logo-40A3F7F4A0-seeklogo.com.png'
          }
        },
        {
          code: 'DANA',
          name: 'DANA',
          method: 'E_WALLET',
          status: 'ACTIVE',
          paymentGatewayFee: 1500,
          logo: {
            url: 'https://seeklogo.com/images/D/dana-logo-8A96BB0A0A-seeklogo.com.png'
          }
        },
        {
          code: 'BCA',
          name: 'Bank BCA',
          method: 'BANK_TRANSFER',
          status: 'ACTIVE',
          paymentGatewayFee: 5000,
          logo: {
            url: 'https://seeklogo.com/images/B/bank-bca-logo-8D8F84CBAB-seeklogo.com.png'
          }
        },
        {
          code: 'MANDIRI',
          name: 'Bank Mandiri',
          method: 'BANK_TRANSFER',
          status: 'ACTIVE',
          paymentGatewayFee: 5000,
          logo: {
            url: 'https://seeklogo.com/images/B/bank-mandiri-logo-3F8F285F34-seeklogo.com.png'
          }
        }
      ]
    };
  }

  async processPayment(email: string, referenceId: string, paymentMethod: string, paymentGatewayFee: number): Promise<any> {
    // Static payment processing data
    return {
      paymentUrl: `https://payment-gateway.example.com/pay?ref=${referenceId}&method=${paymentMethod}`,
      qrCode: paymentMethod === 'QRIS' ? `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==` : null,
      virtualAccountNumber: paymentMethod.includes('BANK') ? `8876${Date.now().toString().slice(-6)}` : null,
      amount: await this.getTotalAmount(referenceId),
      paymentMethod,
      expiresAt: new Date(Date.now() + (30 * 60 * 1000)), // 30 minutes from now
      instructions: this.getPaymentInstructions(paymentMethod)
    };
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
      supportContact: 'support@whygym.com'
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
}
