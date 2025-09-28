import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { User } from "./user.model";
import type { IUser } from "./user.interface";
import { QueryBuilder } from "../../builder/QueryBuilder";
import { searchableFields } from "./user.utils";

const registerUser = async (userData: IUser) => {
  const { name, email, password, role, phone } = userData;
  if (!userData.name || !userData.email || !userData.phone) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Name and email are required");
  }
  console.log(userData, "service");
  const result = await User.create(userData);
  return result;
};
const blockUserFromDB = async (userId) => {
  const result = await User.findByIdAndUpdate(
    userId,
    { isBlocked: true },
    { new: true }
  );
  return result;
};
const unblockUserFromDB = async (userId) => {
  const result = await User.findByIdAndUpdate(
    userId,
    { isBlocked: false },
    { new: true }
  );
  return result;
};
const updateRoleFromDB = async (userId, role: string) => {
  const result = await User.findByIdAndUpdate(
    userId,
    { role },          // shorthand for { role: role }
    { new: true }      // returns the updated document instead of the old one
  );
  return result;
};


const sanitiseQuery = (query: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || trimmed === "null" || trimmed === "undefined") return;
      if (key === "page" || key === "limit") {
        const numeric = Number(trimmed);
        if (!Number.isNaN(numeric) && numeric > 0) {
          cleaned[key] = numeric;
        }
        return;
      }
      cleaned[key] = trimmed;
      return;
    }
    cleaned[key] = value;
  });
  if (!("limit" in cleaned)) cleaned.limit = 10;
  if (!("page" in cleaned)) cleaned.page = 1;
  return cleaned;
};

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const cleanedQuery = sanitiseQuery(query);

  const queryBuilder = new QueryBuilder(User.find().select("-password"), cleanedQuery)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await queryBuilder.modelQuery.lean();
  const meta = await queryBuilder.countTotal();

  return { result, meta };
};

export const UserServices = {
  registerUser,
  getAllUsersFromDB,
  blockUserFromDB,
  unblockUserFromDB,updateRoleFromDB
};
