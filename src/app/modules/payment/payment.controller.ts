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

const getPaymentsByUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await PaymentService.getPaymentsByUser(userId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Payments retrieved successfully",
    success: true,
    data: result,
  });
});

const getPaymentReceipt = catchAsync(async (req, res) => {
  const { paymentId } = req.params;

  const receipt = await PaymentService.generateReceipt(paymentId);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="receipt-${paymentId}.txt"`
  );

  res.send(receipt);
});

export const PaymentController = {
  createPaymentC,
  confirmPaymentC,
  getPaymentsByUser,
  getPaymentReceipt,
};
