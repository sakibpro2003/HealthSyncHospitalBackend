import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { PrescriptionController } from "./prescription.controller";

const router = Router();

router.post(
  "/",
  auth(UserRole.DOCTOR),
  PrescriptionController.createPrescription
);

router.get(
  "/doctor",
  auth(UserRole.DOCTOR),
  PrescriptionController.getDoctorPrescriptions
);

router.get(
  "/patient/:patientId",
  auth(UserRole.USER, UserRole.DOCTOR, UserRole.ADMIN, UserRole.RECEPTIONIST),
  PrescriptionController.getPatientPrescriptions
);

router.get(
  "/:prescriptionId/download",
  auth(UserRole.USER, UserRole.DOCTOR, UserRole.ADMIN, UserRole.RECEPTIONIST),
  PrescriptionController.downloadPrescription
);

export const PrescriptionRoutes = router;
