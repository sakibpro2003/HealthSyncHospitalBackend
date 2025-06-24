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
    message: "Blood rr",
    data: { result },
  });
});

export const BloodBankController = {
  getAvailableBloodQuantity,
};
