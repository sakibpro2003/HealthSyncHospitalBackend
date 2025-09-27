import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const createPaymentC = catchAsync(async (req, res) => {
  const sessionId = await PaymentService.createPayment(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Checkout session created successfully",
    success: true,
    data: { id: sessionId }, // frontend expects {id: "..."}
  });
});

const confirmPaymentC = catchAsync(async (req, res) => {
  const { sessionId } = req.body;

  const paymentRecord = await PaymentService.confirmPayment(sessionId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Payment captured successfully",
    success: true,
    data: paymentRecord,
  });
});

export const PaymentController = {
  createPaymentC,
  confirmPaymentC,
};
