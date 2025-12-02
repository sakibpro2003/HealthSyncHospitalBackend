import type { Types } from "mongoose";

export interface IPrescription {
  _id?: Types.ObjectId;
  doctor: Types.ObjectId;
  patient: Types.ObjectId;
  appointment: Types.ObjectId;
  diagnosis?: string;
  complaints?: string;
  medications?: string[];
  advice?: string;
  followUpDate?: Date | string | null;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
