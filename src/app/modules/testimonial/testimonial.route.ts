import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { testimonialController } from "./testimonial.controller";

const router = Router();

router.get("/approved", testimonialController.getApprovedTestimonials);
router.get(
  "/mine",
  auth(UserRole.USER),
  testimonialController.getMyTestimonials
);
router.get("/", auth(UserRole.ADMIN), testimonialController.getTestimonials);

router.post(
  "/",
  auth(UserRole.USER),
  testimonialController.submitTestimonial
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  testimonialController.updateTestimonialStatus
);

export const TestimonialRoutes = router;
