import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { QueryBuilder } from "../../builder/QueryBuilder";
import AppError from "../../errors/appError";
import { doctorSearchableFields } from "./doctor.constants";
import type { IDoctor } from "./doctor.interface";
import { Doctor } from "./doctor.model";
import config from "../../config";

const saltRounds = Number(config.bcrypt_salt_rounds ?? 10);

const hashPasswordIfPresent = async (
  payload: Partial<IDoctor>
): Promise<void> => {
  if (payload.password && payload.password.trim().length > 0) {
    payload.password = await bcrypt.hash(payload.password, saltRounds);
  } else {
    delete payload.password;
  }
};

const createDoctor = async (doctorData: IDoctor) => {
  await hashPasswordIfPresent(doctorData);
  const result = await Doctor.create(doctorData);
  return result;
};

//type to object.id
const deleteDoctor = async (_id: string | undefined) => {
  if (!_id) {
    throw new AppError(StatusCodes.NOT_FOUND, "ID is Required!");
  }
  const res = await Doctor.findByIdAndDelete(_id);
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

const getSingleDoctor = async (_id: string | undefined) => {
  if (!_id) {
    throw new AppError(StatusCodes.NOT_FOUND, "ID is required");
  }

  const result = await Doctor.findById({ _id });
  return result;
};

const updateDoctor = async (
  _id: string | undefined,
  doctorPayload: Partial<IDoctor>
) => {
  if (!_id) {
    throw new AppError(StatusCodes.NOT_FOUND, "ID is required");
  }

  await hashPasswordIfPresent(doctorPayload);

  const result = await Doctor.findByIdAndUpdate(_id, doctorPayload, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const DoctorService = {
  createDoctor,
  getAllDoctor,
  getSingleDoctor,
  deleteDoctor,
  updateDoctor,
};
