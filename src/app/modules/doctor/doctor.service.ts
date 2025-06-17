import { StatusCodes } from "http-status-codes";
import { QueryBuilder } from "../../builder/QueryBuilder";
import AppError from "../../errors/appError";
import { doctorSearchableFields } from "./doctor.constants";
import type { IDoctor } from "./doctor.interface";
import { Doctor } from "./doctor.model";

const createDoctor = async (doctorData: IDoctor) => {
  const res = await Doctor.create(doctorData);
  return res;
};

const getAllDoctor = async (query: Record<string, unknown>) => {
  const doctorQuery = new QueryBuilder(Doctor.find(), query)
    .search(doctorSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await doctorQuery.modelQuery;
  const meta = await doctorQuery.countTotal();
  return { meta, result };
};

const getSingleDoctor = async (_id) => {
  if (!_id) {
    throw new AppError(StatusCodes.NOT_FOUND, "ID is required");
  }

  const result = await Doctor.findById({ _id });
  return result;
};

export const DoctorService = {
  createDoctor,
  getAllDoctor,getSingleDoctor
};
