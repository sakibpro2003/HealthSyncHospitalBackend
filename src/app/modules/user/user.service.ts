import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { User } from "./user.model";

const registerUser = async (userData) => {
  const { name, email, password, role } = userData;
  if (!userData.name || !userData.email) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Name and email are required");
  }
  const result = await User.create({ name, email, password, role });
  return result;
};

export const UserServices = {
  registerUser,
};
