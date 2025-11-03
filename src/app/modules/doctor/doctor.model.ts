import {
  Schema,
  model,
  type Model,
  type HydratedDocument,
} from "mongoose";
import bcrypt from "bcryptjs";
import config from "../../config";
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

const doctorSchema = new Schema<IDoctor, DoctorModel>(
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
    password: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const saltRounds = Number(config.bcrypt_salt_rounds ?? 10);

doctorSchema.pre("save", async function (next) {
  const doctor = this as HydratedDocument<IDoctor>;

  if (!doctor.isModified("password") || !doctor.password) {
    return next();
  }

  doctor.password = await bcrypt.hash(doctor.password, saltRounds);
  next();
});

doctorSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

doctorSchema.set("toObject", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

doctorSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export interface DoctorModel extends Model<IDoctor> {
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}

export const Doctor = model<IDoctor, DoctorModel>("Doctor", doctorSchema);
