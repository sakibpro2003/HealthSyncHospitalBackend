import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { BloodBank } from "./bloodBank.model";
import { BloodBankService } from "./bloodBank.service";
import catchAsync from "../../utils/catchAsync";

const getAvailableBloodQuantity = catchAsync(async (req, res) => {
  const result = await BloodBankService.getAvailableBloodQuantity();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blood bank data retrieved successfully",
    data: { result },
  });
});

const donateBlood = catchAsync(async (req, res) => {
  const patientData = req.body;
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Donated successfully",
    data: { patientData },
  });
});

export const BloodBankController = {
  getAvailableBloodQuantity,
  donateBlood
};
