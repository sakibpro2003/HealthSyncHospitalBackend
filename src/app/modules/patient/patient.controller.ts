import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PatientService } from "./patient.service";
import AppError from "../../errors/appError";

const registerPatient = catchAsync(async (req, res) => {
  const result = await PatientService.registerPatient(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Patient registration successful",
    success: true,
    data: { result },
  });
});

const updatePatient = catchAsync(async (req, res) => {
  const result = await PatientService.updatePatient(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Patient update successful",
    data: {
      result,
    },
  });
});
const deletePatient = catchAsync(async (req, res) => {
  const result = await PatientService.deletePatient(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Patient deleted successfully",
    success: true,
    data: { result },
  });
});

const getAllPatient = catchAsync(async (req, res) => {
  const result = await PatientService.getAllPatient();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Patient's retrieved successfully",
    data: { result },
  });
});

const getSinglePatient = catchAsync(async (req, res) => {
  console.log(req.params, "params sdkdsksdkl");
  const _id = req.params._id;
  if (!_id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Patient ID is required");
  }
  const result = await PatientService.getSinglePatient(_id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Patient found",
    data: { result },
  });
});

export const PatientController = {
  registerPatient,
  deletePatient,
  updatePatient,
  getAllPatient,
  getSinglePatient,
};
