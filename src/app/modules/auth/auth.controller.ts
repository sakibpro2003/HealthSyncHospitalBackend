// import { NextResponse } from "next/server";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AuthServices } from "./auth.service";

const loginUser = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = await AuthServices.loginUser(req.body);

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
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
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
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
