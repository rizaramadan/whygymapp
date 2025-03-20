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