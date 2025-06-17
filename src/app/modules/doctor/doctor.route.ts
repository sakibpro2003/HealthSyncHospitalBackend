import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.post("/create-doctor", DoctorController.createDoctor);
router.get("/get-all-doctor", DoctorController.getAllDoctor);
router.get(`/get-doctor/:_id`, DoctorController.getSingleDoctor);

export const DoctorRoutes = router;
