import mongoose, { model } from "mongoose";
import type { IBlodBank } from "./bloodBank.interface";
// import { IBlodBank } from "./bloodBank.interface";

const bloodBankSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    availableBlood: {
      type: Map,
      of: Number,
    },
    dateOfBirth: {
      type: Date,
    },
    emergencyContactName: {
      type: String,
    },
    emergencyContactPhone: {
      type: String,
    },
    currentMedication: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const BloodBank = model<IBlodBank>("BloodBank", bloodBankSchema);

