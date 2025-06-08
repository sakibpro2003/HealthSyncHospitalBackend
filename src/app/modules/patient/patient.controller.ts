import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PatientService } from "./patient.service";

const registerPatient = catchAsync(async (req, res) => {
  console.log(req.body,'req body update constoreller')
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

export const PatientController = {
  registerPatient,
  deletePatient,updatePatient
};
