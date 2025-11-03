import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { User } from "./user.model";
import { type IUser } from "./user.interface";
import { QueryBuilder } from "../../builder/QueryBuilder";
import { normaliseUserRole, searchableFields } from "./user.utils";
import { Doctor } from "../doctor/doctor.model";

const registerUser = async (userData: IUser) => {
  const { name, email, password, phone } = userData;

  if (!name || !email || !phone || !password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Name, email, phone and password are required"
    );
  }

  const payload: IUser = {
    ...userData,
    email: email.trim().toLowerCase(),
    role: normaliseUserRole(userData.role),
  };

  const result = await User.create(payload);
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


const getRoleMetrics = async () => {
  const aggregation = await User.aggregate([
    {
      $group: {
        _id: { role: "$role", isBlocked: "$isBlocked" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary: Record<string, { active: number; blocked: number }> = {};

  aggregation.forEach((entry) => {
    const role = entry?._id?.role ?? "unknown";
    const isBlocked = entry?._id?.isBlocked ?? false;
    const count = entry?.count ?? 0;
    if (!summary[role]) {
      summary[role] = { active: 0, blocked: 0 };
    }
    if (isBlocked) {
      summary[role].blocked += count;
    } else {
      summary[role].active += count;
    }
  });

  const doctorCount = await Doctor.countDocuments();
  if (!summary.doctor) {
    summary.doctor = { active: 0, blocked: 0 };
  }
  summary.doctor.active += doctorCount;

  const totals = Object.values(summary).reduce(
    (acc, curr) => {
      acc.active += curr.active;
      acc.blocked += curr.blocked;
      return acc;
    },
    { active: 0, blocked: 0 }
  );

  return { summary, totals };
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
  getRoleMetrics,
  blockUserFromDB,
  unblockUserFromDB,updateRoleFromDB
};
