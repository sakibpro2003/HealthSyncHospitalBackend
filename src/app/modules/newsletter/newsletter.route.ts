import { Router } from "express";
import { NewsletterController } from "./newsletter.controller";

const router = Router();

router.post("/subscribe", NewsletterController.subscribe);

export const NewsletterRoutes = router;
