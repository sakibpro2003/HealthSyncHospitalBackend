import { QueryBuilder } from "../../builder/QueryBuilder";
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

export const DoctorService = {
  createDoctor,getAllDoctor
};
