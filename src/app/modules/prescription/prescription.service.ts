import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errors/appError";
import type { IPrescription } from "./prescription.interface";
import { Prescription } from "./prescription.model";
import { Appointment } from "../appointment/appointment.model";

const createPrescription = async (
  doctorId: string,
  payload: Omit<IPrescription, "_id" | "doctor" | "patient">
) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid doctor id supplied");
  }

  const { appointment, ...rest } = payload;

  if (!appointment || !mongoose.Types.ObjectId.isValid(String(appointment))) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Valid appointment id is required"
    );
  }

  const appointmentRecord = await Appointment.findById(appointment);

  if (!appointmentRecord) {
    throw new AppError(StatusCodes.NOT_FOUND, "Appointment not found");
  }

  if (appointmentRecord.doctor.toString() !== doctorId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not allowed to create a prescription for this appointment"
    );
  }

  const existing = await Prescription.findOne({ appointment });
  if (existing) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "A prescription already exists for this appointment"
    );
  }

  const prescription = await Prescription.create({
    ...rest,
    appointment: appointmentRecord._id,
    patient: appointmentRecord.patient,
    doctor: appointmentRecord.doctor,
  });

  return prescription;
};

const getPrescriptionById = async (
  id: string,
  requester: { role: string; userId: string }
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid prescription id");
  }

  const prescription = await Prescription.findById(id)
    .populate("doctor", "name email")
    .populate("patient", "name email");

  if (!prescription) {
    throw new AppError(StatusCodes.NOT_FOUND, "Prescription not found");
  }

  const isDoctor =
    requester.role === "doctor" &&
    prescription.doctor &&
    prescription.doctor._id?.toString?.() === requester.userId;

  const isPatient =
    prescription.patient &&
    prescription.patient._id?.toString?.() === requester.userId;

  if (!isDoctor && !isPatient) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized to access this prescription"
    );
  }

  return prescription;
};

const getPrescriptionsForDoctor = async (doctorId: string) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid doctor id supplied");
  }

  return Prescription.find({ doctor: doctorId })
    .populate("patient", "name email")
    .populate("appointment", "appointmentDate appointmentTime status")
    .sort({ createdAt: -1 });
};

const getPrescriptionsForPatient = async (patientId: string) => {
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid patient id supplied");
  }

  return Prescription.find({ patient: patientId })
    .populate("doctor", "name email")
    .populate("appointment", "appointmentDate appointmentTime status")
    .sort({ createdAt: -1 });
};

export const PrescriptionService = {
  createPrescription,
  getPrescriptionById,
  getPrescriptionsForDoctor,
  getPrescriptionsForPatient,
};
