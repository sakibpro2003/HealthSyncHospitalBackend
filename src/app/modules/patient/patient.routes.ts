import { Router } from "express";
import { PatientController } from "./patient.controller";

const router = Router();

router.post("/register-patient", PatientController.registerPatient);
// router.put("/register-patient", PatientController.registerPatient);
router.delete("/delete-patient", PatientController.deletePatient);
router.put(`/update-patient/:id`, PatientController.updatePatient);
router.patch(
  "/medical-history/:id",
  PatientController.updateMedicalHistory
);
router.get("/all-patient", PatientController.getAllPatient);
router.get(`/single-patient/:id`, PatientController.getSinglePatient);

export const PatientRoutes = router;
