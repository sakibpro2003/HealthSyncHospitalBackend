// routes/subscription.routes.ts

import express from "express";
import { subscriptionController } from "./subscription.controller";
// import { subscriptionController } from '../controllers/subscription/subscription.controller';

const router = express.Router();

router.post("/", subscriptionController.createSubscription);
router.get(`/:patientId`, subscriptionController.getSubscriptionsByPatient);
router.put(`/cancel/:id`, subscriptionController.cancelSubscription);

export const SubscriptionRouter = router;
