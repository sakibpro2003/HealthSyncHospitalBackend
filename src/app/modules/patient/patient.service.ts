import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import type { IPatient } from "./patient.interface";
import { Patient } from "./patient.model";

const registerPatient = async (patientPayload: IPatient) => {
  const result = await Patient.create(patientPayload);
  return result;
};

const updatePatient = async (id: string, patientPayload: Partial<IPatient>) => {
  const patient = await Patient.findByIdAndUpdate(
    { _id: id, patientPayload },
    { new: true }
  );
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

const getAllPatient = async (query: Record<string, unknown>) => {
  let searchTerm = "";
  const queryObj = { ...query };

  if (query?.searchTerm) {
    searchTerm = query.searchTerm as string;
  }
  const searchableFields = ["name", "address", "phone"];

  const searchQuery = Patient.find({
    $or: searchableFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: "i" },
    })),
  });

  const excludeFields = ["searchTerm", "sort", "limit"];
  excludeFields.forEach((el) => delete queryObj[el]);
  const filterQuery = searchQuery.find(queryObj);
  let sort = "-createdAt";
  if (query.sort) {
    sort = query.sort as string;
  }

  const sortQuery = filterQuery.sort(sort);
  let limit = 1;
  if (query.limit) {
    limit = query.limit as number;
  }
  const limitQuery = sortQuery.limit(limit);
  return sortQuery;
};

export const PatientService = {
  registerPatient,
  deletePatient,
  updatePatient,
  getAllPatient,
  getSinglePatient,
};
