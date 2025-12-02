import { Types } from "mongoose";

export interface IDonor {
  name: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  age: number;
  gender?: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  address: string;
  lastDonationDate: Date;
  available?: boolean;
  quantity: number;
  //   bloodBank?: Types.ObjectId; // Reference to BloodBank
}
