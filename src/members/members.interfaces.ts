/*
{
	"status": true,
	"message": "ok",
	"data": [
		{
			"code": "BNI",
			"name": "Bank BNI",
			"method": "BANK_TRANSFER",
			"minAmount": 1,
			"maxAmount": 50000000000,
			"logo": {
				"width": 320,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436227/darisini-docs/payment/logo/bank-bni_fdgbuv.png",
				"height": 104
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 4445
		},
		{
			"code": "BRI",
			"name": "Bank BRI",
			"method": "BANK_TRANSFER",
			"minAmount": 1,
			"maxAmount": 50000000000,
			"logo": {
				"width": 320,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436227/darisini-docs/payment/logo/bank-bri_k84u38.png",
				"height": 76
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 4445
		},
		{
			"code": "BSI",
			"name": "Bank BSI",
			"method": "BANK_TRANSFER",
			"minAmount": 1,
			"maxAmount": 50000000000,
			"logo": {
				"width": 320,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436228/darisini-docs/payment/logo/bank-bsi_nfu0sg.png",
				"height": 89
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 4445
		},
		{
			"code": "CIMB",
			"name": "CIMB",
			"method": "BANK_TRANSFER",
			"minAmount": 1,
			"maxAmount": 50000000,
			"logo": {
				"width": 320,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436228/darisini-docs/payment/logo/bank-cimb_zdpxcy.png",
				"height": 49
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 4445
		},
		{
			"code": "DANA",
			"name": "Dana",
			"method": "E_WALLET",
			"minAmount": 100,
			"maxAmount": 20000000,
			"logo": {
				"width": 640,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436344/darisini-docs/payment/logo/dana_logo_cfnajr.png",
				"height": 183
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 83255
		},
		{
			"code": "LINKAJA",
			"name": "Link Aja",
			"method": "E_WALLET",
			"minAmount": 1,
			"maxAmount": 20000000,
			"logo": {
				"width": 92,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436228/darisini-docs/payment/logo/link-aja_vzyvtt.png",
				"height": 92
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 83255
		},
		{
			"code": "MANDIRI",
			"name": "Mandiri",
			"method": "BANK_TRANSFER",
			"minAmount": 1000,
			"maxAmount": 50000000000,
			"logo": {
				"width": 320,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436227/darisini-docs/payment/logo/bank-mandiri_cia8cu.png",
				"height": 93
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 4445
		},
		{
			"code": "OVO",
			"name": "OVO",
			"method": "E_WALLET",
			"minAmount": 100,
			"maxAmount": 20000000,
			"logo": {
				"width": 640,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436404/darisini-docs/payment/logo/ovo_logo_aba48z.png",
				"height": 200
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 151520
		},
		{
			"code": "PERMATA",
			"name": "Permata",
			"method": "BANK_TRANSFER",
			"minAmount": 1,
			"maxAmount": 9999999999,
			"logo": {
				"width": 90,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436228/darisini-docs/payment/logo/bank-permata_z5wjlh.png",
				"height": 60
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 4445
		},
		{
			"code": "QRIS",
			"name": "QRIS",
			"method": "QR_CODE",
			"minAmount": 1,
			"maxAmount": 10000000,
			"logo": {
				"width": 136,
				"url": "https://res.cloudinary.com/dwkrjw1vd/image/upload/v1725436228/darisini-docs/payment/logo/qris_lq4rtg.png",
				"height": 52
			},
			"status": "ACTIVE",
			"paymentGatewayFee": 37505
		}
	]
}
*/

export interface PaymentMethod {
  code: string;
  name: string;
  method: string;
  minAmount: number;
  maxAmount: number;
  logo: {
    width: number;
    url: string;
    height: number;
  };
  status: string;
  paymentGatewayFee: number;
}

export interface PaymentMethodsResponse {
  status: boolean;
  message: string;
  data: PaymentMethod[];
}
