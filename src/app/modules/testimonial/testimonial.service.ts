import { StatusCodes } from "http-status-codes";
import type { FilterQuery } from "mongoose";
import AppError from "../../errors/appError";
import { QueryBuilder } from "../../builder/QueryBuilder";
import type { ITestimonial, TestimonialStatus } from "./testimonial.interface";
import { Testimonial } from "./testimonial.model";

const createTestimonial = async (payload: Partial<ITestimonial>) => {
  if (!payload?.content || typeof payload.content !== "string") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Testimonial content is required"
    );
  }

  const rating =
    typeof payload.rating === "number"
      ? Math.min(5, Math.max(1, payload.rating))
      : 5;

  const result = await Testimonial.create({
    patientId: payload.patientId,
    patientName: payload.patientName?.trim() || "Anonymous patient",
    patientEmail: payload.patientEmail?.trim().toLowerCase(),
    content: payload.content.trim(),
    rating,
    status: "pending",
  });

  return result;
};

const getTestimonials = async (query: Record<string, unknown>) => {
  const testimonialQuery = new QueryBuilder(Testimonial.find(), query)
    .search(["patientName", "patientEmail", "content"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await testimonialQuery.modelQuery;
  const meta = await testimonialQuery.countTotal();

  return { result, meta };
};

const updateTestimonialStatus = async (
  id: string,
  status: TestimonialStatus
) => {
  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Testimonial ID is required");
  }

  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid testimonial status");
  }

  const result = await Testimonial.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  return result;
};

const getApprovedTestimonials = async (limit = 12) => {
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Number(limit), 1), 50) : 12;

  const result = await Testimonial.find({ status: "approved" })
    .sort({ updatedAt: -1 })
    .limit(safeLimit);

  return result;
};

const getMyTestimonials = async (patientId?: string, email?: string) => {
  if (!patientId && !email) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Patient identifier is required"
    );
  }

  const filter: FilterQuery<ITestimonial> = {};

  if (patientId) {
    filter.patientId = patientId;
  }

  if (email) {
    filter.patientEmail = email;
  }

  const result = await Testimonial.find(filter).sort({ createdAt: -1 });
  return result;
};

export const testimonialService = {
  createTestimonial,
  getTestimonials,
  updateTestimonialStatus,
  getApprovedTestimonials,
  getMyTestimonials,
};
