import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const createPaymentC = catchAsync(async (req, res) => {
  // console.log(req.body, "🛒 cart received in controller");

  const sessionId = await PaymentService.createPayment(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Checkout session created successfully",
    success: true,
    data: { id: sessionId }, // frontend expects {id: "..."}
  });
});

export const PaymentController = {
  createPaymentC,
};
