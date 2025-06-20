import mongoose, { model, Schema } from "mongoose";
import type { IDonor } from "./donor.interface";

const donorSchema = new Schema<IDonor>(
  {
    name: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    quantity:{
      type:Number,
      required:true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    phone: {
      type: String,
      required: true,
      //   match: /^[0-9]{10,15}$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: String,
    lastDonationDate: {
      type: Date,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Donor = model<IDonor>("Donor", donorSchema);
