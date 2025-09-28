import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errors/appError";
import type { IPatient } from "./patient.interface";
import { Patient } from "./patient.model";
import { QueryBuilder } from "../../builder/QueryBuilder";
import { searchableFields } from "./patient.constants";
import { User } from "../user/user.model";

const registerPatient = async (patientPayload: IPatient) => {
  const result = await Patient.create(patientPayload);
  return result;
};

const updatePatient = async (id: string, patientPayload: Partial<IPatient>) => {
  const updated = await Patient.findByIdAndUpdate(id, patientPayload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new AppError(StatusCodes.NOT_FOUND, "Patient not found!");
  }

  return updated;
};

const updateMedicalHistory = async (
  id: string,
  payload: Partial<
    Pick<IPatient, "medicalHistory" | "allergies" | "currentMedications">
  > & { email?: string }
) => {
  const updateData: Record<string, unknown> = {};

  if (payload.medicalHistory) {
    updateData.medicalHistory = payload.medicalHistory;
  }
  if (payload.allergies) {
    updateData.allergies = payload.allergies;
  }
  if (payload.currentMedications) {
    updateData.currentMedications = payload.currentMedications;
  }

  let updated: IPatient | null = null;

  if (mongoose.Types.ObjectId.isValid(id)) {
    updated = await Patient.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  if (!updated && payload.email) {
    updated = await Patient.findOneAndUpdate(
      { email: payload.email },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  if (!updated) {
    throw new AppError(StatusCodes.NOT_FOUND, "Patient not found!");
  }

  return updated;
};

const deletePatient = async (_id: string) => {
  const patient = await Patient.findOne({ _id });
  if (!patient) {
    throw new AppError(StatusCodes.NOT_FOUND, "Patient not found");
  }
  const result = await Patient.deleteOne({ _id });
  return result;
};

const getSinglePatient = async (id: string) => {
  let result: IPatient | null = null;

  if (mongoose.Types.ObjectId.isValid(id)) {
    result = await Patient.findById(id);
  }

  if (!result) {
    const user = await User.findById(id);
    if (user?.email) {
      result = await Patient.findOne({ email: user.email });
    }
  }

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Patient not found");
  }
  return result;
};

const getAllPatient = async (query: Record<string, unknown>) => {
  const sanitisedQuery: Record<string, unknown> = {};

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "" && key !== "searchTerm") {
        return;
      }
      if (trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
        return;
      }
      if (key === "page" || key === "limit") {
        const numeric = Number(trimmed);
        if (!Number.isNaN(numeric) && numeric > 0) {
          sanitisedQuery[key] = numeric;
        }
        return;
      }
      sanitisedQuery[key] = trimmed;
      return;
    }

    sanitisedQuery[key] = value;
  });

  const patientQuery = new QueryBuilder(Patient.find(), sanitisedQuery)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await patientQuery.modelQuery;
  const meta = await patientQuery.countTotal();
  return { meta, result };
};

export const PatientService = {
  registerPatient,
  deletePatient,
  updatePatient,
  updateMedicalHistory,
  getAllPatient,
  getSinglePatient,
};
