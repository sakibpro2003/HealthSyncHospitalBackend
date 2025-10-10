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
  return (
    totalMinutes >= BOOKING_START_MINUTE && totalMinutes <= BOOKING_END_MINUTE
  );
};

const ensureSlotAvailable = async (
  doctorId: mongoose.Types.ObjectId,
  appointmentDate: Date,
  appointmentTime: string,
  excludeAppointmentId?: mongoose.Types.ObjectId
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
    ...(excludeAppointmentId ? { _id: { $ne: excludeAppointmentId } } : {}),
  });

  if (conflict) {
    throw new Error("The selected slot is no longer available");
  }
};

const prepareAppointmentCheckout = async (
  payload: CreateAppointmentPayload
) => {
  const {
    patient,
    doctor,
    appointmentDate,
    appointmentTime,
    reason,
    patientEmail,
  } = payload;

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

  const doctorObjectId = new mongoose.Types.ObjectId(
    (doctorRecord._id as mongoose.Types.ObjectId | string).toString()
  );

  await ensureSlotAvailable(doctorObjectId, parsedDate, normalisedTime);

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
  const { patientId, doctorId, appointmentDate, appointmentTime, reason } =
    params;

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

const cancelAppointment = async (
  appointmentId: string,
  patientId?: string
): Promise<IAppointment> => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new Error("Invalid appointment id supplied");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (patientId && appointment.patient.toString() !== patientId) {
    throw new Error("You are not authorized to update this appointment");
  }

  if (appointment.status === "cancelled") {
    return appointment.populate([
      {
        path: "doctor",
        select:
          "name department specialization image consultationFee availability",
      },
      { path: "patient", select: "name email" },
    ]);
  }

  appointment.status = "cancelled";
  await appointment.save();

  return appointment.populate([
    {
      path: "doctor",
      select:
        "name department specialization image consultationFee availability",
    },
    { path: "patient", select: "name email" },
  ]);
};

const rescheduleAppointment = async (
  appointmentId: string,
  payload: {
    patientId?: string;
    appointmentDate: string;
    appointmentTime: string;
    reason?: string;
  }
): Promise<IAppointment> => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new Error("Invalid appointment id supplied");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (
    payload.patientId &&
    appointment.patient.toString() !== payload.patientId
  ) {
    throw new Error("You are not authorized to update this appointment");
  }

  if (appointment.status === "cancelled") {
    throw new Error("Cancelled appointments cannot be rescheduled");
  }

  const parsedDate = new Date(payload.appointmentDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid appointment date");
  }

  const normalisedTime = normaliseTime(payload.appointmentTime);

  if (!isWithinBookingWindow(normalisedTime)) {
    throw new Error("Appointments can only be booked between 08:00 and 22:00");
  }

  const doctorObjectId = new mongoose.Types.ObjectId(
    (appointment.doctor as mongoose.Types.ObjectId | string).toString()
  );

  const appointmentObjectId = new mongoose.Types.ObjectId(
    (appointment._id as mongoose.Types.ObjectId | string).toString()
  );

  await ensureSlotAvailable(
    doctorObjectId,
    parsedDate,
    normalisedTime,
    appointmentObjectId
  );

  appointment.appointmentDate = parsedDate;
  appointment.appointmentTime = normalisedTime;
  if (payload.reason) {
    appointment.reason = payload.reason;
  }
  appointment.status = "scheduled";
  await appointment.save();

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

const getAppointmentsByDoctor = async (
  doctorId: string
): Promise<IAppointment[]> => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new Error("Invalid doctor id supplied");
  }

  return Appointment.find({ doctor: doctorId })
    .populate(
      "patient",
      "name email phone"
    )
    .sort({ appointmentDate: 1, appointmentTime: 1 });
};

const completeAppointment = async (
  appointmentId: string,
  options: {
    notes?: string;
  } = {}
): Promise<IAppointment> => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new Error("Invalid appointment id supplied");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status === "cancelled") {
    throw new Error("Cancelled appointments cannot be completed");
  }

  appointment.status = "completed";

  if (options.notes) {
    appointment.notes = options.notes;
  }

  await appointment.save();

  return appointment.populate([
    {
      path: "doctor",
      select:
        "name department specialization image consultationFee availability",
    },
    {
      path: "patient",
      select: "name email",
    },
  ]);
};

export const appointmentService = {
  prepareAppointmentCheckout,
  createAppointmentRecord,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  completeAppointment,
};
