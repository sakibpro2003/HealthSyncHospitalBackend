import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import type { IUser } from "../user/user.interface";
// import User from "../user/user.model";
// import User from "../user/user.model"
import { User } from "../user/user.model";
import type { IAuth, IJWTPayload } from "./auth.interface";
import { createToken } from "./auth.utils";
import config from "../../config";


//TODO: session/ transaction

const loginUser = async (payload: IAuth) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "The user does not exist");
  }
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(StatusCodes.FORBIDDEN, "Wrong password");
  }

  const JWTPayload: IJWTPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    JWTPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    JWTPayload,
    config.jwt_refresh_secret as string,
    config.jwt_access_expires_in as string
  );

  return { accessToken, refreshToken };
};

export const AuthServices = {
  loginUser,
};
