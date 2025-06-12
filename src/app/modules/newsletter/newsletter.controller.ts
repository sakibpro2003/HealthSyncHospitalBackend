import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { NewsletterServices } from "./newsletter.service";

const subscribe = catchAsync(async (req, res) => {
    console.log(req.body,'email')
  const result = await NewsletterServices.subscribe(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Thanks for subscribing",
    success: true,
    data: { result },
  });
});

export const NewsletterController = {
  subscribe,
};
