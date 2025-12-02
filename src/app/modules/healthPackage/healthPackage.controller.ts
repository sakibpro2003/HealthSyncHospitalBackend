import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { healthPackageService } from "./healthPackage.service";

const createHealthPackage = catchAsync(async (req, res) => {
  console.log(req.body, "pack");
  const result = await healthPackageService.createHealthPackage(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Successfully created",
    data: { result },
  });
});
const getAllHealthPackage = catchAsync(async (req, res) => {
  const result = await healthPackageService.getAllHealthPackage();
  sendResponse(res, {
    success: true,
    message: "Successfully created",
    statusCode: StatusCodes.OK,
    data: { result },
  });
});
const updateHealthPackage = catchAsync(async (req, res) => {
  const _id = req.params.id;
  const payload = req.body;

  const result = await healthPackageService.updateHealthPackage(_id, req.body);
  sendResponse(res, {
    success: true,
    message: "Successfully created",
    statusCode: StatusCodes.OK,
    data: { result },
  });
});
const deleteHealthPackage = catchAsync(async (req, res) => {
  const _id = req.params;
  const result = await healthPackageService.deleteHealthPackageFromDB(_id);
  sendResponse(res, {
    success: true,
    message: "Successfully deleted",
    statusCode: StatusCodes.OK,
    data: {},
  });
});

export const healthPackageController = {
  createHealthPackage,
  getAllHealthPackage,
  updateHealthPackage,
  deleteHealthPackage,
};
