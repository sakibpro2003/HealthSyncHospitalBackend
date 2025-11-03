import { Schema, model, type Model } from "mongoose";
import type { IPrescription } from "./prescription.interface";

const prescriptionSchema = new Schema<IPrescription>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    complaints: {
      type: String,
      trim: true,
    },
    medications: {
      type: [String],
      default: [],
    },
    advice: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.index({ doctor: 1, patient: 1, createdAt: -1 });

export const Prescription: Model<IPrescription> = model<IPrescription>(
  "Prescription",
  prescriptionSchema
);
