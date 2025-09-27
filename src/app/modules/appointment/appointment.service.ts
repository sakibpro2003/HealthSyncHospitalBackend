import mongoose from "mongoose";
import type {
  CreateAppointmentPayload,
  IAppointment,
} from "./appointment.interface";
import { Appointment } from "./appointment.model";
import { Doctor } from "../doctor/doctor.model";

const BOOKING_START_MINUTE = 8 * 60; // 08:00
const BOOKING_END_MINUTE = 22 * 60; // 22:00

const timeToMinutes = (time: string): number => {
  const [hourStr, minuteStr] = time.split(":");
  const hours = Number(hourStr);
  const minutes = Number(minuteStr);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid appointment time format");
  }

  return hours * 60 + minutes;
};

const normaliseTime = (time: string): string => {
  const minutes = timeToMinutes(time);
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

const isWithinBookingWindow = (time: string): boolean => {
  const totalMinutes = timeToMinutes(time);
  return totalMinutes >= BOOKING_START_MINUTE && totalMinutes <= BOOKING_END_MINUTE;
};

const ensureSlotAvailable = async (
  doctorId: mongoose.Types.ObjectId,
  appointmentDate: Date,
  appointmentTime: string
): Promise<void> => {
  const dayStart = new Date(appointmentDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(appointmentDate);
  dayEnd.setHours(23, 59, 59, 999);

  const conflict = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate: { $gte: dayStart, $lte: dayEnd },
    appointmentTime,
    status: { $in: ["scheduled", "completed"] },
  });

  if (conflict) {
    throw new Error("The selected slot is no longer available");
  }
};

const prepareAppointmentCheckout = async (
  payload: CreateAppointmentPayload
) => {
  const { patient, doctor, appointmentDate, appointmentTime, reason, patientEmail } =
    payload;

  if (!mongoose.Types.ObjectId.isValid(patient)) {
    throw new Error("Invalid patient id supplied");
  }

  if (!mongoose.Types.ObjectId.isValid(doctor)) {
    throw new Error("Invalid doctor id supplied");
  }

  const doctorRecord = await Doctor.findById(doctor);
  if (!doctorRecord) {
    throw new Error("Doctor not found");
  }

  const parsedDate = new Date(appointmentDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid appointment date");
  }

  const normalisedTime = normaliseTime(appointmentTime);

  if (!isWithinBookingWindow(normalisedTime)) {
    throw new Error("Appointments can only be booked between 08:00 and 22:00");
  }

  await ensureSlotAvailable(doctorRecord._id, parsedDate, normalisedTime);

  return {
    patientId: patient,
    patientEmail,
    doctor: doctorRecord,
    appointmentDate: parsedDate,
    appointmentTime: normalisedTime,
    reason,
  };
};

const createAppointmentRecord = async (params: {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  reason?: string;
}): Promise<IAppointment> => {
  const { patientId, doctorId, appointmentDate, appointmentTime, reason } = params;

  const patientObjectId = new mongoose.Types.ObjectId(patientId);
  const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

  if (!isWithinBookingWindow(appointmentTime)) {
    throw new Error("Appointments can only be booked between 08:00 and 22:00");
  }

  await ensureSlotAvailable(doctorObjectId, appointmentDate, appointmentTime);

  const appointment = await Appointment.create({
    patient: patientObjectId,
    doctor: doctorObjectId,
    appointmentDate,
    appointmentTime,
    reason,
  });

  return appointment.populate([
    {
      path: "doctor",
      select:
        "name department specialization image consultationFee availability",
    },
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
    .populate(
      "doctor",
      "name department specialization image consultationFee availability"
    )
    .sort({ appointmentDate: 1, appointmentTime: 1 });
};

export const appointmentService = {
  prepareAppointmentCheckout,
  createAppointmentRecord,
  getAppointmentsByPatient,
};
