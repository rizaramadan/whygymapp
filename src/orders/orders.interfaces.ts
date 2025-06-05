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
    if ((additionalData as AdditionalData)?.duration) {
      this.title = `Membership payment duration ${(additionalData as AdditionalData).duration || ''}`;
    } 
    this.amount = amount;
    this.invoiceDuration = 3600;
    this.customerEmail = email;
    if (customerFullName && customerFullName.length > 0) {
      this.customerFullName = customerFullName;
    } else {
      this.customerFullName = email;
    }
    this.paymentChannelCode = paymentChannelCode;

    if ((additionalData as AdditionalData)?.duration) {
      this.description = `Membership payment for ${email} duration ${(additionalData as AdditionalData).duration || ''}`;
    } else {
      this.description = `Membership payment for ${email}`;
    }
  }

  public static createPrivateCoachingFeeInvoiceRequest(
    referenceId: string,
    url: string,
    email: string,
    additionalData: any,
    amount: number,
    customerFullName: string,
    customerPhone: string,
    paymentChannelCode: string,
    coachType: string,
    numberOfSessions: number,
  ) {
    const request = new CreateInvoiceRequest(
      referenceId,
      url,
      email,
      additionalData,
      amount,
      customerFullName,
      customerPhone,
      paymentChannelCode,
    );
    request.failureRedirectUrl = `${url}/orders/payment-private-coaching-fee/${referenceId}/fail`;
    request.successRedirectUrl = `${url}/orders/payment-private-coaching-fee/${referenceId}/success`;
    request.description = `Private coaching fee payment for ${email} ${coachType} ${numberOfSessions} sessions`;
    request.title = request.description;
    return request;
  }

  public static createExtensionOrderInvoiceRequest(
    referenceId: string,
    url: string,
    email: string,
    customerFullName: string,
    paymentChannelCode: string,
    duration: number,
    amount: number,
  ) {
    const request = new CreateInvoiceRequest(
      referenceId,
      url,
      email,
      {},
      amount,
      customerFullName,
      '',
      paymentChannelCode,
    );
    request.failureRedirectUrl = `${url}/member-extend/payment/${referenceId}/fail`;
    request.successRedirectUrl = `${url}/member-extend/payment/${referenceId}/success`;
    request.title = `Extension ${email} for ${duration} days`;
    request.description = request.title;
    return request;
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
