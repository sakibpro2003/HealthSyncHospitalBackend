import { QueryBuilder } from "../../builder/QueryBuilder";
import { donorSearchableFields } from "./donor.constant";
import type { IDonor } from "./donor.interface";
import { Donor } from "./donor.model";

const createDonor = async (donorPayload: IDonor) => {
  const result = await Donor.create(donorPayload);
  return result;
};
const getAllDonor = async (query: Record<string, unknown>) => {
  const donorQuery = new QueryBuilder(Donor.find(), query)
    .search(donorSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await donorQuery.modelQuery;
  const meta = await donorQuery.countTotal();
  // console.log(result.lastDonationDate,'ress')
  const today = new Date();
  console.log(today);
  {
  }

  return { meta, result };
};

const deleteDonor = async (_id: string) => {
  const res = await Donor.findByIdAndDelete(_id);
  return res;
};

export const DonorService = {
  createDonor,
  getAllDonor,
  deleteDonor,
};
