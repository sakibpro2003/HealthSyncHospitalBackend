import { Router } from "express";
import { BloodBankController } from "./bloodBank.controller";

const router = Router();
router.get("/get-quantity", BloodBankController.getAvailableBloodQuantity);

export const BloodBankRoutes = router;
