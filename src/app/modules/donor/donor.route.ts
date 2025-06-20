import { Router } from "express";
import { DonorController } from "./donor.controller";

const router = Router();

router.post("/register-donor", DonorController.createDonor);
router.get("/all-donor", DonorController.getAllDonor);
router.delete("/delete-donor", DonorController.deleteDonor);

export const DonorRoutes = router;
