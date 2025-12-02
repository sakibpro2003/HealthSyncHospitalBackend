import type { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { UserRole } from "../modules/user/user.interface";
import AppError from "../errors/appError";
import { StatusCodes } from "http-status-codes";
import jwt, { TokenExpiredError, type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { User } from "../modules/user/user.model";
import { Doctor } from "../modules/doctor/doctor.model";
import { normaliseUserRole } from "../modules/user/user.utils";

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;
    const token = bearerToken || req.cookies?.token;

    if (!token || typeof token !== "string" || token.length === 0) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
    }

    try {
      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;

      const { role: rawRole, email } = decoded as JwtPayload & { role?: string };

      if (!rawRole) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      const effectiveRole = normaliseUserRole(rawRole);

      if (requiredRoles.length && !requiredRoles.includes(effectiveRole)) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      if (!email) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      if (effectiveRole === UserRole.DOCTOR) {
        const doctor = await Doctor.findOne({ email });

        if (!doctor) {
          throw new AppError(StatusCodes.NOT_FOUND, "This user is not found!");
        }
      } else {
        const roleFilter =
          effectiveRole === UserRole.USER
            ? { $in: [UserRole.USER, "patient"] }
            : effectiveRole;

        const user = await User.findOne({ email, role: roleFilter });

        if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, "This user is not found!");
        }

        if (user.isBlocked) {
          throw new AppError(
            StatusCodes.FORBIDDEN,
            "Your account has been blocked"
          );
        }
      }

      req.user = {
        ...(decoded as JwtPayload),
        role: effectiveRole,
      };
      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(
          new AppError(
            StatusCodes.UNAUTHORIZED,
            "Token has expired! Please login again."
          )
        );
      }
      return next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid token!"));
    }
  });
};

export default auth;
