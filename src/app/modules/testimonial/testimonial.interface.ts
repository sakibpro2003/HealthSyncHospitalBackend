import { Types } from "mongoose";

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface ITestimonial {
  patientId?: Types.ObjectId | string;
  patientName: string;
  patientEmail?: string;
  content: string;
  rating?: number;
  status: TestimonialStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
