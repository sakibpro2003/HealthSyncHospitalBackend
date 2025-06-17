import mongoose, { Schema, Document, model } from "mongoose";
import type { IDoctor } from "./doctor.interface";

const Department = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "General",
  "Radiology",
  "Psychiatry",
  "Emergency",
  "Dental",
  "Oncology",
  "Urology",
];

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    image: String,
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: Department,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    education: {
      type: [String],
      required: true,
    },
    availability: {
      days: {
        type: [String],
        required: true,
      },
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
    },
    experience: {
      type: String,
    },
    bio: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = model<IDoctor>("Doctor", doctorSchema);
