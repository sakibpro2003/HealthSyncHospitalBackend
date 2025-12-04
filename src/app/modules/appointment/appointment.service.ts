import mongoose from "mongoose";
import type {
  CreateAppointmentPayload,
  IAppointment,
} from "./appointment.interface";
import { Appointment } from "./appointment.model";
import { Doctor } from "../doctor/doctor.model";
import { Prescription } from "../prescription/prescription.model";

const isObjectId = (value: unknown): value is mongoose.Types.ObjectId =>
  value instanceof mongoose.Types.ObjectId;

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

  const doctorObjectId = isObjectId(doctorRecord._id)
    ? doctorRecord._id
    : new mongoose.Types.ObjectId(String(doctorRecord._id));

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

const createAppointmentByStaff = async (
  payload: CreateAppointmentPayload
): Promise<IAppointment> => {
  const prepared = await prepareAppointmentCheckout(payload);

  const doctorId =
    isObjectId(prepared.doctor._id) || prepared.doctor._id instanceof mongoose.Types.ObjectId
      ? prepared.doctor._id.toString()
      : String(prepared.doctor._id);

  return createAppointmentRecord({
    patientId: prepared.patientId,
    doctorId,
    appointmentDate: prepared.appointmentDate,
    appointmentTime: prepared.appointmentTime,
    reason: payload.reason,
  });
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

const combineDateAndTime = (date: Date, time: string): Date => {
  const [hourStr, minuteStr] = time.split(":");
  const combined = new Date(date);
  combined.setHours(Number(hourStr), Number(minuteStr), 0, 0);
  return combined;
};

const getAppointmentsByDoctor = async (
  doctorId: string
): Promise<{
  upcoming: Array<Record<string, unknown>>;
  history: Array<Record<string, unknown>>;
  stats: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  nextAppointment: Record<string, unknown> | null;
}> => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new Error("Invalid doctor id supplied");
  }

  const appointments = await Appointment.find({ doctor: doctorId })
    .populate(
      "patient",
      "name email phone address"
    )
    .sort({ appointmentDate: 1, appointmentTime: 1 });

  const appointmentIds = appointments.map((appointment) =>
    isObjectId(appointment._id)
      ? appointment._id.toString()
      : String(appointment._id)
  );

  const prescriptions = await Prescription.find({
    appointment: { $in: appointmentIds },
  })
    .populate("doctor", "name email")
    .populate("patient", "name email")
    .lean();

  const prescriptionMap = new Map(
    prescriptions.map((prescription) => [
      prescription.appointment.toString(),
      prescription,
    ])
  );

  const now = new Date();

  const upcoming: Array<Record<string, unknown>> = [];
  const history: Array<Record<string, unknown>> = [];
  const stats = {
    total: appointments.length,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  };

  appointments.forEach((appointment) => {
    stats[appointment.status as keyof typeof stats] =
      (stats[appointment.status as keyof typeof stats] ?? 0) + 1;

    const appointmentDateTime = combineDateAndTime(
      appointment.appointmentDate,
      appointment.appointmentTime
    );

    const appointmentObject = appointment.toObject() as unknown as Record<
      string,
      unknown
    >;
    const appointmentId = isObjectId(appointment._id)
      ? appointment._id.toString()
      : String(appointment._id);

    const prescriptionRecord = prescriptionMap.get(
      appointmentId
    ) as
      | {
          _id: mongoose.Types.ObjectId;
          diagnosis?: string;
          followUpDate?: Date;
          createdAt?: Date;
        }
      | undefined;

    const serialized = {
      ...appointmentObject,
      _id: appointmentId,
      prescription: prescriptionRecord
        ? {
            _id: prescriptionRecord._id.toString(),
            diagnosis: prescriptionRecord.diagnosis,
            followUpDate: prescriptionRecord.followUpDate,
            createdAt: prescriptionRecord.createdAt,
          }
        : null,
    };

    if (
      appointment.status === "scheduled" &&
      appointmentDateTime.getTime() >= now.getTime()
    ) {
      upcoming.push(serialized);
    } else {
      history.push(serialized);
    }
  });

  return {
    upcoming,
    history: history.reverse(), // most recent first
    stats,
    nextAppointment: upcoming.length > 0 ? upcoming[0] : null,
  };
};

const completeAppointment = async (
  appointmentId: string,
  doctorId: string,
  options: { notes?: string } = {}
): Promise<IAppointment> => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new Error("Invalid appointment id supplied");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const appointmentDoctorId = isObjectId(appointment.doctor)
    ? appointment.doctor.toString()
    : String(appointment.doctor);

  if (appointmentDoctorId !== doctorId) {
    throw new Error("You are not authorized to update this appointment");
  }

  if (appointment.status === "cancelled") {
    throw new Error("Cancelled appointments cannot be completed");
  }

  if (appointment.status !== "completed") {
    appointment.status = "completed";
  }

  if (options.notes) {
    appointment.notes = options.notes;
  }

  await appointment.save();

  return appointment.populate([
    {
      path: "patient",
      select: "name email phone address",
    },
    {
      path: "doctor",
      select:
        "name email department specialization image consultationFee availability",
    },
  ]);
};

export const appointmentService = {
  prepareAppointmentCheckout,
  createAppointmentRecord,
  createAppointmentByStaff,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  completeAppointment,
};
