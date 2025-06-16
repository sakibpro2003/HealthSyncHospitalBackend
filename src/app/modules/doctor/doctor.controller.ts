import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DoctorService } from "./doctor.service";

const createDoctor = catchAsync(async (req, res) => {
  const result = await DoctorService.createDoctor(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Doctor created successfully",
    data: { result },
  });
});
const getAllDoctor = catchAsync(async (req, res) => {
  const result = await DoctorService.getAllDoctor(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Doctor created successfully",
    data: { result },
  });
});

export const DoctorController = {
  createDoctor,getAllDoctor
};
