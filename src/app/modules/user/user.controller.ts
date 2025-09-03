import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserServices } from "./user.service";
import catchAsync from "../../utils/catchAsync";
import { get } from "http";

const registerUser = catchAsync(async (req, res) => {
  const userData = req.body;
  const result = await UserServices.registerUser(userData);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User registration completed successfully",
    data: {
      result,
    },
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrieved successfully",
    data: {
      result,
    },
  });
});

export const UserController = {
  registerUser,
  getAllUsers,
};
