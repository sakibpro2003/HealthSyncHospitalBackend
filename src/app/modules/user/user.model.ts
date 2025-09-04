import mongoose, { Schema } from "mongoose";
import { type IUser, type UserModel, UserRole } from "./user.interface";
import bcrypt from "bcryptjs";
import config from "../../config";
import type { Model } from "mongoose";
import { required } from "zod/v4-mini";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },

    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: bloodGroups,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [UserRole.ADMIN, UserRole.RECEPTIONIST],
      default: UserRole.RECEPTIONIST,
    },
    isBlocked:{
      type: Boolean,
      default: false,
    }
    // hasShop: {
    //   type: Boolean,
    //   default: false,
    // },
    // clientInfo: {
    //   device: {
    //     type: String,
    //     enum: ["pc", "mobile"],
    //     required: true,
    //   },
    //   browser: {
    //     type: String,
    //     required: true,
    //   },
    //   ipAddress: {
    //     type: String,
    //     required: true,
    //   },
    //   pcName: {
    //     type: String,
    //   },
    //   os: {
    //     type: String,
    //   },
    //   userAgent: {
    //     type: String,
    //   },
    // },
    // lastLogin: {
    //   type: Date,
    //   default: Date.now,
    // },
    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },
    // otpToken: {
    //   type: String,
    //   default: null,
    // },
  },
  {
    timestamps: true,
  }
);

//hash password before storing
userSchema.pre("save", async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

//hide password
userSchema.post("save", async function (doc, next) {
  doc.password = "";
  next();
});

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
// export default User;
