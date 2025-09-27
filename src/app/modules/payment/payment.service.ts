import mongoose from "mongoose";
import Stripe from "stripe";
import config from "../../config";
import Payment from "./payment.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

type RawCheckoutItem = {
  _id?: string;
  productId?: string;
  packageId?: string;
  patientId?: string;
  title?: string;
  name?: string;
  price: number;
  quantity?: number;
  image?: string;
  type?: "product" | "package";
};

type CreateCheckoutPayload = {
  items: RawCheckoutItem[];
  userId?: string;
  email?: string;
};

type NormalisedCheckoutItem = {
  productId?: string;
  packageId?: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
  type: "product" | "package";
};

const normaliseItem = (item: RawCheckoutItem): NormalisedCheckoutItem => {
  const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
  if (item.packageId) {
    return {
      packageId: item.packageId,
      title: item.title ?? item.name ?? "Package",
      quantity,
      price: item.price,
      image: item.image,
      type: "package",
    };
  }

  return {
    productId: item.productId ?? item._id,
    title: item.title ?? item.name ?? "Product",
    quantity,
    price: item.price,
    image: item.image,
    type: "product",
  };
};

const derivePayload = (data: CreateCheckoutPayload | RawCheckoutItem[]) => {
  if (Array.isArray(data)) {
    return {
      items: data,
      userId: data[0]?.patientId ?? data[0]?.userId,
      email: undefined,
    };
  }
  return data;
};

const toObjectId = (value?: string) => {
  if (!value) {
    return undefined;
  }
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : undefined;
};

export const createPayment = async (
  payload: CreateCheckoutPayload | RawCheckoutItem[]
) => {
  const { items: rawItems, userId, email } = derivePayload(payload);

  if (!rawItems?.length) {
    throw new Error("No items supplied for checkout session");
  }

  const inferredUserId = userId ?? rawItems[0]?.patientId;
  if (!inferredUserId) {
    throw new Error("User id is required to create a payment session");
  }

  const userObjectId = toObjectId(inferredUserId);
  if (!userObjectId) {
    throw new Error("Invalid user id supplied for payment session");
  }

  const items = rawItems.map(normaliseItem);

  const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const paymentRecord = await Payment.create({
    user: userObjectId,
    email,
    amount,
    currency: "usd",
    status: "pending",
    items: items.map((item) => ({
      ...item,
      productId: toObjectId(item.productId),
      packageId: toObjectId(item.packageId),
    })),
    metadata: {
      rawItems,
    },
  });

  const line_items = items.map((item) => {
    const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
      currency: "usd",
      product_data: {
        name: item.title,
      },
      unit_amount: Math.round(item.price * 100),
    };

    if (item.image) {
      priceData.product_data!.images = [item.image];
    }

    return {
      price_data: priceData,
      quantity: item.quantity,
    } satisfies Stripe.Checkout.SessionCreateParams.LineItem;
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${config.next_base_url}/success-payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.next_base_url}/failed-payment`,
      metadata: {
        paymentId: paymentRecord._id.toString(),
      },
    });

    paymentRecord.stripeSessionId = session.id;
    await paymentRecord.save();

    return session.id;
  } catch (error) {
    await Payment.findByIdAndDelete(paymentRecord._id).catch(() => undefined);
    console.error("Stripe Error:", error);
    throw error;
  }
};

export const confirmPayment = async (sessionId: string) => {
  if (!sessionId) {
    throw new Error("Stripe session id is required");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });

  if (!session.metadata?.paymentId) {
    throw new Error("Payment reference missing from Stripe session");
  }

  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed yet");
  }

  const paymentRecord = await Payment.findById(session.metadata.paymentId);

  if (!paymentRecord) {
    throw new Error("Payment record not found");
  }

  if (paymentRecord.status === "paid") {
    return paymentRecord;
  }

  const paymentIntent = session.payment_intent;
  const paymentIntentId =
    typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id;

  paymentRecord.status = "paid";
  paymentRecord.stripePaymentIntentId = paymentIntentId ?? undefined;
  paymentRecord.amount = session.amount_total
    ? session.amount_total / 100
    : paymentRecord.amount;
  paymentRecord.currency = session.currency ?? paymentRecord.currency;
  paymentRecord.email =
    session.customer_details?.email ?? paymentRecord.email ?? undefined;
  paymentRecord.paidAt = new Date();

  await paymentRecord.save();

  return paymentRecord;
};

export const PaymentService = { createPayment, confirmPayment };
