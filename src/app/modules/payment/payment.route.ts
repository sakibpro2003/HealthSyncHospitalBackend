import { Router } from "express";
import { PaymentController } from "./payment.controller";

const router = Router();
router.post("/create-checkout-session", PaymentController.createPaymentC);
router.post("/confirm", PaymentController.confirmPaymentC);
router.get("/user/:userId", PaymentController.getPaymentsByUser);
router.get("/:paymentId/receipt", PaymentController.getPaymentReceipt);

export const PaymentRouter = router;
