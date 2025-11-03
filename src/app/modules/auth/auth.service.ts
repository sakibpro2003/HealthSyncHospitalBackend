import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { User } from "../user/user.model";
import { Doctor } from "../doctor/doctor.model";
import type { IAuth, IJWTPayload } from "./auth.interface";
import { createToken } from "./auth.utils";
import config from "../../config";
import { UserRole } from "../user/user.interface";
import { normaliseUserRole } from "../user/user.utils";

//TODO: session/ transaction

const loginUser = async (payload: IAuth) => {
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password;

  if (!email || !password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Email and password are required"
    );
  }

  const user = await User.findOne({ email }).select("+password");
  let payloadToSign: IJWTPayload | null = null;

  if (user) {
    if (user.isBlocked) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Your account has been blocked"
      );
    }

    if (
      typeof user.password !== "string" ||
      !(await User.isPasswordMatched(password, user.password))
    ) {
      throw new AppError(StatusCodes.FORBIDDEN, "Wrong password");
    }

    payloadToSign = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: normaliseUserRole(user.role),
    };
  } else {
    const doctor = await Doctor.findOne({ email }).select("+password");

    if (!doctor || !doctor.password) {
      throw new AppError(StatusCodes.NOT_FOUND, "The user does not exist");
    }

    const isMatched = await Doctor.isPasswordMatched(password, doctor.password);

    if (!isMatched) {
      throw new AppError(StatusCodes.FORBIDDEN, "Wrong password");
    }

    payloadToSign = {
      userId: doctor.id,
      name: doctor.name,
      email: doctor.email,
      role: UserRole.DOCTOR,
    };
  }

  if (!payloadToSign) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Unable to create authentication token"
    );
  }

  const accessToken = createToken(
    payloadToSign,
    config.jwt_access_secret as string
  );

  const refreshToken = createToken(
    payloadToSign,
    config.jwt_refresh_secret as string
  );

  return { accessToken, refreshToken };
};

export const AuthServices = {
  loginUser,
};
