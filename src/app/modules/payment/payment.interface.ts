// // src/modules/payment/payment.interface.ts

// export interface CustomerInfo {
//   name: string;
//   email: string;
//   phone: string;
//   address?: string;
//   city?: string;
//   postcode?: string | number;
//   country?: string;
// }

// export interface ShippingInfo {
//   address?: string;
//   city?: string;
//   postcode?: string | number;
//   country?: string;
// }

// export interface InitPaymentDTO {
//   amount: number;
//   currency?: string; // default "BDT"
//   orderId: string;
//   userId: string;
//   customer: CustomerInfo;
//   shipping?: ShippingInfo;
// }

// export interface InitData {
//   total_amount: number;
//   currency: string;
//   tran_id: string;
//   success_url: string;
//   fail_url: string;
//   cancel_url: string;
//   ipn_url?: string; // optional
//   cus_name: string;
//   cus_email: string;
//   cus_add1: string;
//   cus_city: string;
//   cus_postcode: string;
//   cus_country: string;
//   cus_phone: string;

//   ship_name?: string;
//   ship_add1?: string;
//   ship_city?: string;
//   ship_postcode?: string;
//   ship_country?: string;

//   product_name: string;
//   product_category: string;
//   product_profile: string;
// }

// export interface IPayment {
//   orderId: string;
//   userId: string;
//   tranId: string;
//   amount: number;
//   currency: string;
//   status: "INITIATED" | "VALIDATED" | "FAILED" | "CANCELLED";
//   valId?: string;
//   cardType?: string;
//   storeId?: string;
//   riskTitle?: string;
//   gatewayResponse?: Record<string, any>;
//   sessionKey?: string;
//   paidAt?: Date;
// }
