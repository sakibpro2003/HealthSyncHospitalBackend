import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errors/appError";
import { testimonialService } from "./testimonial.service";

const submitTestimonial = catchAsync(async (req, res) => {
  const authUser = req.user as JwtPayload & {
    userId?: string;
    email?: string;
    name?: string;
  };

  const result = await testimonialService.createTestimonial({
    patientId: authUser?.userId,
    patientEmail: authUser?.email,
    patientName: req.body?.patientName ?? authUser?.name ?? "Patient",
    content: req.body?.content,
    rating: req.body?.rating,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Testimonial submitted for approval",
    data: { result },
  });
});

const getTestimonials = catchAsync(async (req, res) => {
  const result = await testimonialService.getTestimonials(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Testimonials retrieved successfully",
    data: { result: result.result },
    meta: result.meta,
  });
});

const updateTestimonialStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Testimonial ID is required");
  }

  const result = await testimonialService.updateTestimonialStatus(
    id,
    status as any
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Testimonial status updated",
    data: { result },
  });
});

const getApprovedTestimonials = catchAsync(async (req, res) => {
  const limit = Number(req.query?.limit) || 12;
  const result = await testimonialService.getApprovedTestimonials(limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Approved testimonials retrieved successfully",
    data: { result },
  });
});

const getMyTestimonials = catchAsync(async (req, res) => {
  const authUser = req.user as JwtPayload & {
    userId?: string;
    email?: string;
  };

  if (!authUser?.userId && !authUser?.email) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
  }

  const result = await testimonialService.getMyTestimonials(
    authUser.userId,
    authUser.email
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Your testimonials retrieved successfully",
    data: { result },
  });
});

export const testimonialController = {
  submitTestimonial,
  getTestimonials,
  updateTestimonialStatus,
  getApprovedTestimonials,
  getMyTestimonials,
};
