export interface PaymentMethod {
  code: string;
  name: string;
  method: 'BANK_TRANSFER' | 'E_WALLET' | 'QR_CODE';
  minAmount: number;
  maxAmount: number;
  logo: {
    url: string;
  };
  status: 'ACTIVE' | 'DISABLED';
  paymentGatewayFee: number;
  reason?: string;
}

export interface PaymentMethodsResponse {
  status: boolean;
  message: string;
  data: PaymentMethod[];
}

export interface CheckoutResponse {
  user: any; // Replace with proper User type
  referenceId: string;
  order: any; // Replace with proper Order type
  paymentMethods: PaymentMethodsResponse;
  membershipFee: number;
  paymentGatewayFee: number;
  tax: number;
  total: number;
  invoice: CreateInvoiceResponse | null;
}

export interface AdditionalData {
  duration?: string;
}
/**example */
export class CreateInvoiceRequest {
  failureRedirectUrl: string;
  successRedirectUrl: string;
  title: string;
  description: string;
  amount: number;
  invoiceDuration: number;
  customerEmail: string;
  customerFullName: string;
  customerPhone: string;
  paymentChannelCode: string;

  constructor(
    referenceId: string,
    url: string,
    email: string,
    additionalData: any,
    amount: number,
    customerFullName: string,
    customerPhone: string,
    paymentChannelCode: string,
  ) {
    this.failureRedirectUrl = `${url}/orders/payment/${referenceId}/fail`;
    this.successRedirectUrl = `${url}/orders/payment/${referenceId}/success`;
    this.title = 'Membership Payment';
    this.amount = amount;
    this.invoiceDuration = 3600;
    this.customerEmail = email;
    if (customerFullName.length > 0) {
      this.customerFullName = customerFullName;
    } else {
      this.customerFullName = email;
    }
    this.paymentChannelCode = paymentChannelCode;

    this.paymentChannelCode = paymentChannelCode;

    if ((additionalData as AdditionalData)?.duration) {
      this.description = `Membership payment for ${email} duration ${(additionalData as AdditionalData).duration || ''}`;
    } else {
      this.description = `Membership payment for ${email}`;
    }
  }
}
export interface CreateInvoiceResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: InvoiceData;
}
export interface InvoiceData {
  title: string;
  description: string;
  customerFullName: string;
  customerEmail: string;
  id: string;
  publicId: string;
  status: string;
  orderId: string;
  expiredDate: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  paymentGatewayFee: number;
  total: number;
  paymentUrl: string;
  paymentMethod: string;
  paymentChannel: string;
  paidAt: string | null;
}
