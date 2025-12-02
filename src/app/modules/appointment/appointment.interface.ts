import { Document, Types } from "mongoose";

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface IAppointment extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  reason?: string;
  status: AppointmentStatus;
  notes?: string;
}

export type CreateAppointmentPayload = {
  patient: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  patientEmail?: string;
};
