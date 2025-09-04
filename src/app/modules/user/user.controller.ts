import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserServices } from "./user.service";
import catchAsync from "../../utils/catchAsync";

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
const blockUser = catchAsync(async (req, res) => {
  // const userId = req.params;
  // console.log(userId, "controller");
  const result = await UserServices.blockUserFromDB(req.params.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User blocked",
    data: {
      result,
    },
  });
});
const unblockUser = catchAsync(async (req, res) => {
  // const userId = req.params;
  // console.log(userId, "controller");
  const result = await UserServices.unblockUserFromDB(req.params.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User unblocked",
    data: {
      result,
    },
  });
});
const updateRole = catchAsync(async (req, res) => {
  // const userId = req.params;
  // console.log(userId, "controller");
  const result = await UserServices.updateRoleFromDB(req.params.userId,req.body.role);
  console.log(req.body.role, "role");
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User role updated",
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
  blockUser,unblockUser,updateRole
};
