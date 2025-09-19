import type { IHealthPackage } from "./healthPackage.interface";
import { HealthPackage } from "./healthPackage.model";

const createHealthPackage = async (payload: IHealthPackage) => {
  const result = await HealthPackage.create(payload);
  return result;
};

const getAllHealthPackage = async () => {
  const result = await HealthPackage.find();
  return result;
};

const updateHealthPackage = async (
  _id: string,
  payload: Partial<IHealthPackage>
) => {
  const result = await HealthPackage.findByIdAndUpdate(_id, payload, {
    new: true,
  });
  return result;
};

const deleteHealthPackageFromDB = async (_id: string) => {
  const result = await HealthPackage.findByIdAndDelete(_id);
  return result;
};

export const healthPackageService = {
  createHealthPackage,
  getAllHealthPackage,
  updateHealthPackage,
  deleteHealthPackageFromDB,
};
