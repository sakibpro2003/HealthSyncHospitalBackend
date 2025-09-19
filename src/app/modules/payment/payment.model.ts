// // src/modules/payment/payment.model.ts
// import { Schema, model } from "mongoose";
// import type { IPayment } from "./payment.interface";

// const PaymentSchema = new Schema<IPayment>(
//   {
//     orderId: { type: String, required: true, index: true },
//     userId: { type: String },
//     tranId: { type: String, required: true, unique: true, index: true },
//     amount: { type: Number, required: true },
//     currency: { type: String, default: "BDT" },
//     status: {
//       type: String,
//       enum: ["INITIATED", "PENDING", "VALIDATED", "FAILED", "CANCELLED"],
//       default: "INITIATED",
//       index: true,
//     },
//     sessionKey: { type: String },
//     valId: { type: String },
//     cardType: { type: String },
//     storeId: { type: String },
//     riskTitle: { type: String },
//     gatewayResponse: { type: Schema.Types.Mixed },
//     paidAt: { type: Date },
//   },
//   { timestamps: true }
// );

// export const PaymentModel = model<IPayment>("Payment", PaymentSchema);


import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    transactionId: {
      type: String, // better to use String (UUID, Stripe ID, etc.)
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // status: {
    //   type: String,
    //   enum: ["pending", "completed", "failed"],
    //   default: "pending",
    // },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
