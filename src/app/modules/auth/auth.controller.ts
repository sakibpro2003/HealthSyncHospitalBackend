// import { NextResponse } from "next/server";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AuthServices } from "./auth.service";

const loginUser = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = await AuthServices.loginUser(req.body);

  const isProduction = process.env.NODE_ENV === "production";
  const isLocalhost =
    req.hostname === "localhost" || req.hostname === "127.0.0.1";
  // Avoid Secure cookies on plain HTTP during local development even if NODE_ENV=production.
  const useSecure = isProduction && !isLocalhost && req.protocol === "https";

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: useSecure,
    sameSite: useSecure ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Login successfull",
    success: true,
    data: {
      //!dont return tokens
      //TODO: data._id,data._name can be sent from here
      accessToken,
      refreshToken,
    },
  });
});

const logout = catchAsync(async (req, res) => {
  console.log("lgout controller");
  const isProduction = process.env.NODE_ENV === "production";
  const isLocalhost =
    req.hostname === "localhost" || req.hostname === "127.0.0.1";
  const useSecure = isProduction && !isLocalhost && req.protocol === "https";

  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    secure: useSecure,
    sameSite: useSecure ? "none" : "lax",
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged out successfully",
    data: {},
  });
});

export const AuthController = {
  loginUser,
  logout,
};
