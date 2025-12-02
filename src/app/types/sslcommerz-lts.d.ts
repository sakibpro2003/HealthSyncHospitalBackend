declare module "sslcommerz-lts" {
  interface SSLCommerzPaymentConstructor {
    new (
      store_id: string,
      store_passwd: string,
      isSandboxMode: boolean
    ): SSLCommerzPayment;
  }

  interface InitData {
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url?: string;

    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_city: string;
    cus_postcode: string;
    cus_country: string;
    cus_phone: string;

    ship_name: string;
    ship_add1: string;
    ship_city: string;
    ship_postcode: string;
    ship_country: string;

    product_name: string;
    product_category: string;
    product_profile: string;
  }

  interface SSLCommerzPayment {
    init(data: InitData): Promise<any>;
    validate(data: { val_id: string }): Promise<any>;
  }

  const SSLCommerzPayment: SSLCommerzPaymentConstructor;
  export default SSLCommerzPayment;
}
