import mongoose from "mongoose";
import Stripe from "stripe";
import config from "../../config";
import Payment from "./payment.model";
import { subscriptionService } from "../subscription/subscription.service";
import { appointmentService } from "../appointment/appointment.service";
import { User } from "../user/user.model";
import AppError from "../../errors/appError";
import { StatusCodes } from "http-status-codes";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type RawCheckoutItem = {
  _id?: string;
  productId?: string;
  packageId?: string;
  patientId?: string;
  userId?: string;
  doctorId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  reason?: string;
  title?: string;
  name?: string;
  price: number;
  quantity?: number;
  image?: string;
  type?: "product" | "package" | "appointment";
};

type CreateCheckoutPayload = {
  items: RawCheckoutItem[];
  userId?: string;
  email?: string;
  metadata?: Record<string, any>;
};

type NormalisedCheckoutItem = {
  productId?: string;
  packageId?: string;
  doctorId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  reason?: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
  type: "product" | "package" | "appointment";
};

const MINIMUM_CHECKOUT_AMOUNT = 50; // Stripe minimum in BDT (~$0.50)

const normaliseItem = (item: RawCheckoutItem): NormalisedCheckoutItem => {
  const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
  if (item.type === "appointment" || item.doctorId) {
    return {
      doctorId: item.doctorId,
      appointmentDate: item.appointmentDate,
      appointmentTime: item.appointmentTime,
      reason: item.reason,
      title: item.title ?? item.name ?? "Doctor Consultation",
      quantity,
      price: item.price,
      type: "appointment",
    };
  }
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
      metadata: undefined,
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
  const { items: rawItems, userId, email, metadata } = derivePayload(payload);

  if (!rawItems?.length) {
    throw new Error("No items supplied for checkout session");
  }

  const inferredUserId = userId ?? rawItems[0]?.patientId;
  if (!inferredUserId && !email) {
    throw new Error(
      "User id or email is required to create a payment session"
    );
  }

  let userObjectId = toObjectId(inferredUserId);

  if (!userObjectId && email) {
    const userDoc = await User.findOne({ email }).select({ _id: 1 });
    if (userDoc?._id) {
      userObjectId = userDoc._id;
    }
  }

  if (!userObjectId) {
    throw new Error("Invalid user id supplied for payment session");
  }

  const items = rawItems.map(normaliseItem);

  const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (amount < MINIMUM_CHECKOUT_AMOUNT) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Minimum payment amount is ৳${MINIMUM_CHECKOUT_AMOUNT}. Please add more items to your cart.`
    );
  }

  const paymentRecord = await Payment.create({
    user: userObjectId,
    email,
    amount,
    currency: "bdt",
    status: "pending",
    items: items.map((item) => ({
      ...item,
      productId: toObjectId(item.productId),
      packageId: toObjectId(item.packageId),
      doctorId: toObjectId(item.doctorId),
      appointmentDate: item.appointmentDate
        ? new Date(item.appointmentDate)
        : undefined,
      appointmentTime: item.appointmentTime,
      reason: item.reason,
    })),
    metadata: {
      rawItems,
      ...(metadata ?? {}),
    },
  });

  const line_items = items.map((item) => {
    const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
      currency: "bdt",
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

  const paymentIntent = session.payment_intent;
  const paymentIntentId =
    typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id;

  const metadataObject = (paymentRecord.metadata ?? {}) as Record<string, any>;

  if (paymentRecord.status !== "paid") {
    paymentRecord.status = "paid";
    paymentRecord.stripePaymentIntentId = paymentIntentId ?? undefined;
    paymentRecord.amount = session.amount_total
      ? session.amount_total / 100
      : paymentRecord.amount;
    paymentRecord.currency = session.currency ?? paymentRecord.currency;
    paymentRecord.email =
      session.customer_details?.email ?? paymentRecord.email ?? undefined;
    paymentRecord.paidAt = new Date();
  }

  const packageItems = paymentRecord.items.filter(
    (item) => item.type === "package" && item.packageId
  );

  if (
    packageItems.length &&
    !metadataObject.subscriptionsCreated &&
    paymentRecord.user
  ) {
    const userId = paymentRecord.user.toString();
    const createdSubscriptions = [];

    for (const item of packageItems) {
      const packageId =
        typeof item.packageId === "string"
          ? item.packageId
          : item.packageId?.toString();

      if (!packageId) {
        continue;
      }

      const subscription = await subscriptionService.createSubscription(
        userId,
        packageId,
        false
      );
      createdSubscriptions.push(subscription._id.toString());
    }

    if (createdSubscriptions.length) {
      metadataObject.subscriptionsCreated = true;
      const existingIds = Array.isArray(metadataObject.subscriptionIds)
        ? metadataObject.subscriptionIds
        : [];
      metadataObject.subscriptionIds = [
        ...new Set([...existingIds, ...createdSubscriptions]),
      ];
      paymentRecord.metadata = metadataObject;
      paymentRecord.markModified("metadata");
    }
  }

  const appointmentItems = paymentRecord.items.filter(
    (item) =>
      item.type === "appointment" &&
      item.doctorId &&
      item.appointmentDate &&
      item.appointmentTime
  );

  if (
    appointmentItems.length &&
    !metadataObject.appointmentsCreated &&
    paymentRecord.user
  ) {
    const appointmentIds: string[] = [];
    const patientId = paymentRecord.user.toString();

    for (const item of appointmentItems) {
      const doctorId =
        typeof item.doctorId === "string"
          ? item.doctorId
          : item.doctorId?.toString();

      if (!doctorId || !(item.appointmentDate instanceof Date)) {
        continue;
      }

      const appointment = await appointmentService.createAppointmentRecord({
        patientId,
        doctorId,
        appointmentDate: item.appointmentDate,
        appointmentTime: item.appointmentTime!,
        reason: item.reason ?? metadataObject.reason,
      });

      const appointmentObjectId = (appointment._id instanceof mongoose.Types.ObjectId)
        ? appointment._id
        : new mongoose.Types.ObjectId((appointment._id as mongoose.Types.ObjectId | string).toString());

      appointmentIds.push(appointmentObjectId.toString());
    }

    if (appointmentIds.length) {
      metadataObject.appointmentsCreated = true;
      metadataObject.appointmentIds = [
        ...new Set([...(metadataObject.appointmentIds ?? []), ...appointmentIds]),
      ];
      paymentRecord.metadata = metadataObject;
      paymentRecord.markModified("metadata");
    }
  }

  await paymentRecord.save();

  return paymentRecord;
};

const summarisePayments = (payments: any[]) => {
  const summary = {
    totalTransactions: payments.length,
    paidCount: 0,
    paidAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    failedCount: 0,
    failedAmount: 0,
  };

  payments.forEach((payment) => {
    if (payment.status === "paid") {
      summary.paidCount += 1;
      summary.paidAmount += payment.amount;
    } else if (payment.status === "pending") {
      summary.pendingCount += 1;
      summary.pendingAmount += payment.amount;
    } else if (payment.status === "failed") {
      summary.failedCount += 1;
      summary.failedAmount += payment.amount;
    }
  });

  return summary;
};

export const getPaymentsByUser = async (
  userId: string,
  query: Record<string, any>
) => {
  const pickString = (value: unknown) =>
    Array.isArray(value) ? value[0] : typeof value === "string" ? value : undefined;

  const status = pickString(query.status);
  const type = pickString(query.type);
  const from = pickString(query.from);
  const to = pickString(query.to);

  let userObjectId = toObjectId(userId);

  if (!userObjectId) {
    const userDoc = await User.findById(userId).select({ _id: 1 });
    if (userDoc?._id) {
      userObjectId = userDoc._id;
    }
  }

  if (!userObjectId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid user reference supplied"
    );
  }

  const filter: Record<string, any> = { user: userObjectId };

  if (status) {
    filter.status = status;
  }

  if (type) {
    filter.items = { $elemMatch: { type } };
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (!Number.isNaN(fromDate.getTime())) {
        filter.createdAt.$gte = fromDate;
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (!Number.isNaN(toDate.getTime())) {
        filter.createdAt.$lte = toDate;
      }
    }
    if (Object.keys(filter.createdAt).length === 0) {
      delete filter.createdAt;
    }
  }

  const payments = await Payment.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  const summary = summarisePayments(payments as any);

  return {
    summary,
    payments,
  };
};

const buildReceiptText = (payment: any) => {
  const lines: string[] = [];
  lines.push("HealthSync Hospital");
  lines.push("Billing Receipt");
  lines.push("------------------------------");
  lines.push(`Receipt ID: ${payment._id}`);
  lines.push(
    `Payment Date: ${payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "Pending"}`
  );
  lines.push(`Status: ${payment.status}`);
  lines.push(
    `Amount Paid: ৳${payment.amount.toFixed(2)} ${payment.currency?.toUpperCase()}`
  );
  lines.push("");
  lines.push("Items:");
  payment.items.forEach((item: any, index: number) => {
    const total = (item.price || 0) * (item.quantity || 1);
    lines.push(
      `${index + 1}. ${item.title} x${item.quantity} - ৳${(
        item.price ?? 0
      ).toFixed(2)} (Total: ৳${total.toFixed(2)}${item.type ? `, ${item.type}` : ""})`
    );
    if (item.type === "appointment" && item.appointmentDate && item.appointmentTime) {
      lines.push(
        `   Appointment: ${new Date(item.appointmentDate).toLocaleDateString()} at ${item.appointmentTime}`
      );
    }
  });
  lines.push("");
  lines.push("Thank you for choosing HealthSync Hospital.");
  lines.push("For support please contact billing@healthsync.com");

  return lines.join("\n");
};

export const generateReceipt = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).lean();

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, "Payment not found");
  }

  const receiptText = buildReceiptText(payment);

  return Buffer.from(receiptText, "utf-8");
};

export const PaymentService = {
  createPayment,
  confirmPayment,
  getPaymentsByUser,
  generateReceipt,
};
