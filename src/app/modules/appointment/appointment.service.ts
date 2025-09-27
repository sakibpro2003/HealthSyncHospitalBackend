import mongoose from "mongoose";
import type {
  CreateAppointmentPayload,
  IAppointment,
} from "./appointment.interface";
import { Appointment } from "./appointment.model";
import { Doctor } from "../doctor/doctor.model";

const createAppointment = async (
  payload: CreateAppointmentPayload
): Promise<IAppointment> => {
  const { patient, doctor, appointmentDate, appointmentTime, reason } = payload;

  if (!mongoose.Types.ObjectId.isValid(patient)) {
    throw new Error("Invalid patient id supplied");
  }

  if (!mongoose.Types.ObjectId.isValid(doctor)) {
    throw new Error("Invalid doctor id supplied");
  }

  const doctorExists = await Doctor.exists({ _id: doctor });
  if (!doctorExists) {
    throw new Error("Doctor not found");
  }

  const parsedDate = new Date(appointmentDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid appointment date");
  }

  const appointment = await Appointment.create({
    patient,
    doctor,
    appointmentDate: parsedDate,
    appointmentTime,
    reason,
  });

  return appointment.populate([
    { path: "doctor", select: "name department specialization image consultationFee availability" },
    { path: "patient", select: "name email" },
  ]);
};

const getAppointmentsByPatient = async (
  patientId: string
): Promise<IAppointment[]> => {
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw new Error("Invalid patient id supplied");
  }

  return Appointment.find({ patient: patientId })
    .populate("doctor", "name department specialization image consultationFee availability")
    .sort({ appointmentDate: 1, appointmentTime: 1 });
};

export const appointmentService = {
  createAppointment,
  getAppointmentsByPatient,
};
