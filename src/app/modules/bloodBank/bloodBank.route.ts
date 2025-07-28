import { Router } from "express";
import { BloodBankController } from "./bloodBank.controller";

const router = Router();
router.get("/get-quantity", BloodBankController.getAvailableBloodQuantity);
router.post("/donate-blood", BloodBankController.donateBlood);

export const BloodBankRoutes = router;
