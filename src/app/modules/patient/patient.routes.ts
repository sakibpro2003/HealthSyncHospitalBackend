import { Router } from "express";
import { PatientController } from "./patient.controller";

const router = Router();

router.post("/register-patient", PatientController.registerPatient);
router.post("/delete-patient", PatientController.deletePatient);
router.put("/update-patient", PatientController.updatePatient);

export const PatientRoutes = router;
