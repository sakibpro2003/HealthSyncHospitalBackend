import { Router } from "express";
import { PaymentController } from "./payment.controller";

const router = Router();
router.post("/create-checkout-session", PaymentController.createPaymentC);
router.post("/confirm", PaymentController.confirmPaymentC);

export const PaymentRouter = router;
