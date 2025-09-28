import { Router } from "express";
import { appointmentController } from "./appointment.controller";

const router = Router();

router.post("/checkout", appointmentController.initiateAppointmentCheckout);
router.get("/patient/:patientId", appointmentController.getAppointmentsByPatient);
router.patch(
  "/:appointmentId/reschedule",
  appointmentController.rescheduleAppointment
);
router.patch(
  "/:appointmentId/cancel",
  appointmentController.cancelAppointment
);

export const AppointmentRouter = router;
