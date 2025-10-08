import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.post("/create-doctor", DoctorController.createDoctor);
router.get("/get-all-doctor", DoctorController.getAllDoctor);
router.get(`/get-doctor/:_id`, DoctorController.getSingleDoctor);
router.put(`/update-doctor/:_id`, DoctorController.updateDoctor);
router.delete(`/delete-doctor/:_id`, DoctorController.deleteDoctor);

export const DoctorRoutes = router;
