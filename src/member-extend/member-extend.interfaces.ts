export interface PaymentInput {
  // User information from request
  user: {
    email: string;
  };
  
  // URL parameters
  referenceId: string;
  
  // Request body parameters
  selectedMethod: string;
  paymentGatewayFee: string;
  
  // Additional payment details from the checkout
  total: number;
  subtotal: number;
  tax: number;
  extensionDuration: string;
  currentExpiry: Date;
  newExpiry: Date;
}

export interface PaymentResponse {
  paymentUrl?: string;
  qrCode?: string;
  virtualAccountNumber?: string;
  amount: number;
  paymentMethod: string;
  expiresAt: Date;
  instructions: string[];
  referenceId: string;
} 