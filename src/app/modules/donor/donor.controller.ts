import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DonorService } from "./donor.service";

const createDonor = catchAsync(async (req, res) => {
  const result = await DonorService.createDonor(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Donor created successful",
    data: { result },
  });
});

const getAllDonor = catchAsync(async (req, res) => {
  const result = await DonorService.getAllDonor(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Donor retrieved successful",
    data: { result },
  });
});

const deleteDonor = catchAsync(async (req, res) => {
  const param = req.params;
  const { _id } = param;
  const result = await DonorService.deleteDonor(_id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Donor created successful",
    data: { result },
  });
});
const getSingleDonor = catchAsync(async (req, res) => {
  const param = req.params;
  const { _id } = param;
  const result = await DonorService.getSingleDonor(_id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Donor retrieved successful",
    data: { result },
  });
});

export const DonorController = {
  createDonor,
  deleteDonor,
  getAllDonor,getSingleDonor
};
