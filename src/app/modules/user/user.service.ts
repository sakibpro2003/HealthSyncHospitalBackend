import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { User } from "./user.model";

const registerUser = async (userData) => {
  // const checkExisting email =
  const { name, email, password, role } = userData;
  console.log(name,'name from serivce');
  if (!userData.name || !userData.email) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Name and email are required");
  }
  const res = await User.create({ name, email, password, role });
  return res;
};

export const UserServices = {
  registerUser,
};
