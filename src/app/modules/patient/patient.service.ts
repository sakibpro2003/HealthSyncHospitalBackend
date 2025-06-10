import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import type { IPatient } from "./patient.interface";
import { Patient } from "./patient.model";
import { sendResponse } from "../../utils/sendResponse";

const registerPatient = async (patientPayload: IPatient) => {
  const result = await Patient.create(patientPayload);
  return result;
};

const updatePatient = async (patientPayload: Partial<IPatient>) => {
  const patient = await Patient.findById(patientPayload._id);
  if (!patient) {
    throw new AppError(StatusCodes.NOT_FOUND, "Patient not found!");
  }
  const result = await Patient.findByIdAndUpdate(
    patientPayload._id,
    patientPayload,
    { new: true }
  );
  return result;
};

const deletePatient = async (_id: string) => {
  const patient = await Patient.findOne({ _id });
  if (!patient) {
    throw new AppError(StatusCodes.NOT_FOUND, "Patient not found");
  }
  const result = await Patient.deleteOne({ _id });
  return result;
};

const getSinglePatient = async (_id: string) => {
  const result = await Patient.findById(_id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Patient not found");
  }
  return result;
};

const getAllPatient = async () => {
  const result = await Patient.find();
  return result;
};

// const updatePatient = async (_id) => {
//   if (!_id) {
//     throw new AppError(StatusCodes.BAD_REQUEST, "ID is required!");
//   }
//   const result = await Patient.findByIdAndUpdate(_id);
//   return result;
// };

export const PatientService = {
  registerPatient,
  deletePatient,
  updatePatient,
  getAllPatient,
  getSinglePatient,
  // updatePatient,
};
