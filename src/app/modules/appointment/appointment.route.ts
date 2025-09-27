import { Router } from "express";
import { appointmentController } from "./appointment.controller";

const router = Router();

router.post("/", appointmentController.createAppointment);
router.get("/patient/:patientId", appointmentController.getAppointmentsByPatient);

export const AppointmentRouter = router;
