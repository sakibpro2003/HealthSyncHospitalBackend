import type { Model } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  RECEPTIONIST = "receptionist",
  DOCTOR = "doctor",
}

export type IBloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  hasShop: boolean;
  phone: string;
  address: string;
  gender: string;
  dateOfBirth: Date;
  bloodGroup:string,
  isBlocked: boolean;
  // clientInfo: {
  //   device: "pc" | "mobile"; // Device type
  //   browser: string; // Browser name
  //   ipAddress: string; // User IP address
  //   pcName?: string; // Optional PC name
  //   os?: string; // Optional OS name (Windows, MacOS, etc.)
  //   userAgent?: string; // Optional user agent string
  // };
  lastLogin: Date;
  isActive: boolean;
  otpToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModel extends Model<IUser> {
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isUserExistsByEmail(id: string): Promise<IUser>;
  checkUserExist(userId: string): Promise<IUser>;
}
