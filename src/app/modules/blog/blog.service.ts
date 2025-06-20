import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import type { IBlog } from "./blog.interface";
import { Blog } from "./blog.model";
import { QueryBuilder } from "../../builder/QueryBuilder";
import { blogSearchableFields } from "./blog.constant";

const createBlog = async (blogPayload: IBlog) => {
  if (!blogPayload) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Blog data required");
  }
  const res = await Blog.create(blogPayload);
  return res;
};

const getAllBlog = async (query: Record<string, unknown>) => {
  const blogQuery = new QueryBuilder(Blog.find(), query)
    .search(blogSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();
  return {
    meta,
    result,
  };
};

const deleteBlog = async (_id: string) => {
  if (!_id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "ID is required");
  }

  const res = await Blog.findByIdAndDelete(_id);
  return res;
};

const updateBlog = async (_id: string, updatePayload: Partial<IBlog>) => {
  if (!_id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "ID is required");
  }
  
  const res = await Blog.findByIdAndUpdate(_id, updatePayload, { new: true });
  return res;
};

const BlogService = {
  createBlog,
  getAllBlog,
  deleteBlog,updateBlog
};
