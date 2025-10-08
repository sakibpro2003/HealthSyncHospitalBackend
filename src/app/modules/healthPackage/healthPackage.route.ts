import { Router } from "express";
import { healthPackageController } from "./healthPackage.controller";

const router = Router();

router.post("/package", healthPackageController.createHealthPackage);
router.get("/package", healthPackageController.getAllHealthPackage);
router.put(`/package/:id`,healthPackageController.updateHealthPackage)
router.delete(`/package/:_id`, healthPackageController.deleteHealthPackage);

export const HealthPackageRouter = router;
