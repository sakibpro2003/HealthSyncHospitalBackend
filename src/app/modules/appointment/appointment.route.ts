import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post("/checkout", appointmentController.initiateAppointmentCheckout);
router.get("/patient/:patientId", appointmentController.getAppointmentsByPatient);
router.get(
  "/doctor/overview",
  auth(UserRole.DOCTOR),
  appointmentController.getDoctorAppointments
);
router.get("/doctor/:doctorId", appointmentController.getAppointmentsByDoctor);
router.patch(
  "/:appointmentId/reschedule",
  appointmentController.rescheduleAppointment
);
router.patch(
  "/:appointmentId/cancel",
  appointmentController.cancelAppointment
);
router.patch(
  "/:appointmentId/complete",
  auth(UserRole.DOCTOR),
  appointmentController.completeAppointment
);
export const AppointmentRouter = router;
