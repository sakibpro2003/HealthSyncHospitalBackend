import mongoose, { Schema } from "mongoose";
import { type IUser, UserRole } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config";
const userSchema = new Schema<IUser>(
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
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [UserRole.ADMIN, UserRole.USER],
      default: UserRole.USER,
    },
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

userSchema.pre("save", async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const User = mongoose.model<IUser>("User", userSchema);
