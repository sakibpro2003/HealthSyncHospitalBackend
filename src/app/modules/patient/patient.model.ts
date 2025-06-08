import mongoose, { Schema } from "mongoose";
import { type IPatient } from "./patient.interface";
import { required } from "zod/v4-mini";

export const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
const patientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    role: {
      type: String,
      default: "patient",
    },
    phone: {
      type: String,
      required: true,
    },
    releaseStauts: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: bloodGroups,
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },
    emergencyContact: {
      emergencyContactName: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    occupation: {
      type: String,
    },
    medicalHistory: {
      type: [String],
    },
    allergies: {
      type: [String],
    },
    currentMedications: {
      type: [String],
    },
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Patient = mongoose.model("Patient", patientSchema);
