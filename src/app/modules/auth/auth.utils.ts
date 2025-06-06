import type { IJWTPayload } from "./auth.interface";
import jwt, { type Secret } from "jsonwebtoken";

export const createToken = (
  jwtPayload: IJWTPayload,
  secret: Secret,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn: "770m" });
};
