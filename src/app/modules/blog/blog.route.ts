import { Router } from "express";
import { BlogController } from "./blog.controller";

const router = Router();

router.post("/create-blog", BlogController.createBlog);
router.get("/all-blog", BlogController.getAllBlog);
router.delete(`/delete-blog/:_id`, BlogController.deleteBlog);
router.put(`/update-blog/:_id`, BlogController.updateBlog);
router.get(`/single-blog/:_id`, BlogController.getSingleBlog);

export const BlogRoutes = router;
