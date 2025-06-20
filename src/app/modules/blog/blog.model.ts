import { model, Schema } from "mongoose";
import type { IBlog } from "./blog.interface";

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  hashTags: {
    type: [String],
    default: [],
  },
  author: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
});

export const Blog = model<IBlog>("Blog", blogSchema);
