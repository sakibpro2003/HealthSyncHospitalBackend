import { Schema, model } from "mongoose";
import type { IHealthPackage } from "./healthPackage.interface";

const healthPackageSchema = new Schema<IHealthPackage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    idealFor: {
      type: String,
      required: true,
    },
    includes: {
      type: [String],
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HealthPackage = model<IHealthPackage>(
  "HealthPackage",
  healthPackageSchema
);
