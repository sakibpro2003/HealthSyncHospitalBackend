import { model, Schema } from "mongoose";
import type { AppointmentStatus, IAppointment } from "./appointment.interface";

const statusValues: AppointmentStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
];

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: statusValues,
      default: "scheduled",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ patient: 1, doctor: 1, appointmentDate: 1, appointmentTime: 1 });

export const Appointment = model<IAppointment>("Appointment", appointmentSchema);
