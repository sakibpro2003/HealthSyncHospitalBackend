import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { User } from "./user.model";
import type { IUser } from "./user.interface";

const registerUser = async (userData: IUser) => {
  const { name, email, password, role, phone } = userData;
  if (!userData.name || !userData.email || !userData.phone) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Name and email are required");
  }
  console.log(userData, "service");
  const result = await User.create(userData);
  return result;
};

const getAllUsersFromDB = async () => {
  const result = await User.find({}).select("-password").lean();
  if (!result || result.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "No users found");
  }
  return result;
};

export const UserServices = {
  registerUser,
  getAllUsersFromDB,
};
