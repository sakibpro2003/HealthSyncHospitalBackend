import { Router } from "express";
import { PatientController } from "./patient.controller";

const router = Router();

router.post("/register-patient", PatientController.registerPatient);

export const PatientRoutes = router;
