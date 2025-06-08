import { Router } from "express";
import { PatientController } from "./patient.controller";

const router = Router();

router.post("/register-patient", PatientController.registerPatient);
router.delete("/delete-patient", PatientController.deletePatient);
router.put("/update-patient", PatientController.updatePatient);

export const PatientRoutes = router;
