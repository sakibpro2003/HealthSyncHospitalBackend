// src/app/modules/payment/payment.service.ts
import config from "../../config";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (cartItems: any[]) => {
  const line_items = cartItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: Math.round(item.price * 100), // Stripe expects cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${config.next_base_url}/success-payment`,
    cancel_url: `${config.next_base_url}/failed-payment`,
  });

  return session.id; // only return the sessionId
};

export const PaymentService = { createPayment };
