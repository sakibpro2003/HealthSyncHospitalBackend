import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminDashboardService } from "./adminDashboard.service";

const getAdminDashboardInsights = catchAsync(async (req, res) => {
  const [sales, bloodDonation] = await Promise.all([
    adminDashboardService.calculateSalesBreakdown(),
    adminDashboardService.getDonationHistory(),
  ]);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin dashboard insights retrieved successfully",
    data: {
      sales,
      bloodDonation,
    },
  });
});

export const adminDashboardController = {
  getAdminDashboardInsights,
};
