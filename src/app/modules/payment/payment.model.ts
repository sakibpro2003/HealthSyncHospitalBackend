
import mongoose, { Schema, type Types } from "mongoose";

type PaymentItem = {
  productId?: Types.ObjectId;
  packageId?: Types.ObjectId;
  title: string;
  quantity: number;
  price: number;
  image?: string;
  type: "product" | "package";
};

const paymentItemSchema = new Schema<PaymentItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    packageId: { type: Schema.Types.ObjectId, ref: "HealthPackage" },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    type: { type: String, enum: ["product", "package"], required: true },
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    items: {
      type: [paymentItemSchema],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
