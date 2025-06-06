import { request, response } from "express";

import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AuthServices } from "./auth.service";

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  //   console.log(result, "data");
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Login successfull",
    success: true,
    data: {
      result,
    },
  });
});

export const AuthController = {
  loginUser,
};
