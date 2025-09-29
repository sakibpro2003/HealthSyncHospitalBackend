import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BloodBankService } from "./bloodBank.service";

const getAvailableBloodQuantity = catchAsync(async (req, res) => {
  const result = await BloodBankService.getInventorySummary();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blood inventory summary retrieved successfully",
    data: { result },
  });
});

const listInventories = catchAsync(async (req, res) => {
  const result = await BloodBankService.getInventories();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blood inventory records fetched",
    data: { result },
  });
});

const createInventory = catchAsync(async (req, res) => {
  const result = await BloodBankService.createInventory(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Blood inventory created",
    data: { result },
  });
});

const updateInventory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BloodBankService.updateInventory(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blood inventory updated",
    data: { result },
  });
});

const adjustInventory = catchAsync(async (req, res) => {
  const result = await BloodBankService.adjustInventory(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blood inventory adjusted",
    data: { result },
  });
});

const deleteInventory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BloodBankService.deleteInventory(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blood inventory deleted",
    data: { result },
  });
});

const createBloodRequest = catchAsync(async (req, res) => {
  const result = await BloodBankService.createBloodRequest(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Blood request submitted",
    data: { result },
  });
});

const listBloodRequests = catchAsync(async (req, res) => {
  const result = await BloodBankService.getBloodRequests(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blood requests fetched",
    data: { result },
  });
});

const updateBloodRequestStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BloodBankService.updateBloodRequestStatus(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blood request status updated",
    data: { result },
  });
});

const donationEntry = catchAsync(async (req, res) => {
  const result = await BloodBankService.recordDonation(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Blood donation recorded",
    data: { result },
  });
});

const getInventoryHistory = catchAsync(async (req, res) => {
  const { bloodGroup } = req.query as { bloodGroup?: string };
  const result = await BloodBankService.getInventoryHistory(bloodGroup);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blood inventory history fetched",
    data: { result },
  });
});

export const BloodBankController = {
  getAvailableBloodQuantity,
  listInventories,
  createInventory,
  updateInventory,
  adjustInventory,
  deleteInventory,
  createBloodRequest,
  listBloodRequests,
  updateBloodRequestStatus,
  donationEntry,
  getInventoryHistory,
};
