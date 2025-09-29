import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BlogService } from "./blog.service";
import AppError from "../../errors/appError";

const createBlog = catchAsync(async (req, res) => {
  const result = await BlogService.createBlog(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog create successful",
    data: { result },
  });
});
const getAllBlog = catchAsync(async (req, res) => {
  const result = await BlogService.getAllBlog(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog retrieve successful",
    data: { result },
  });
});
const deleteBlog = catchAsync(async (req, res) => {
  const { _id } = req.params as { _id?: string };
  if (!_id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Blog id is required");
  }
  const result = await BlogService.deleteBlog(_id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog deleted successful",
    data: { result },
  });
});
const updateBlog = catchAsync(async (req, res) => {
  const { _id } = req.params as { _id?: string };
  if (!_id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Blog id is required");
  }
  const result = await BlogService.updateBlog(_id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog updated successful",
    data: { result },
  });
});
const getSingleBlog = catchAsync(async (req, res) => {
  const { _id } = req.params as { _id?: string };
  if (!_id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Blog id is required");
  }
  const result = await BlogService.getSingleBlog(_id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog retrieve successful",
    data: { result },
  });
});

export const BlogController = {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlog,getSingleBlog
};
