import { Router } from "express";
import { PatientController } from "./patient.controller";

const router = Router();

router.post("/register-patient", PatientController.registerPatient);
router.post("/delete-patient", PatientController.deletePatient);

export const PatientRoutes = router;
