import express from "express";
import { BloodBankController } from "./bloodBank.controller";

const router = express.Router();

router.get("/get-quantity", BloodBankController.getAvailableBloodQuantity);
router.get("/inventories", BloodBankController.listInventories);
router.post("/inventories", BloodBankController.createInventory);
router.patch("/inventories/:id", BloodBankController.updateInventory);
router.delete("/inventories/:id", BloodBankController.deleteInventory);
router.post("/adjust", BloodBankController.adjustInventory);
router.post("/donate-blood", BloodBankController.donationEntry);
router.get("/history", BloodBankController.getInventoryHistory);

router.post("/requests", BloodBankController.createBloodRequest);
router.get("/requests", BloodBankController.listBloodRequests);
router.patch("/requests/:id/status", BloodBankController.updateBloodRequestStatus);

export const BloodBankRoutes = router;
