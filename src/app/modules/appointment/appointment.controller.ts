import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { appointmentService } from "./appointment.service";
import { PaymentService } from "../payment/payment.service";

const initiateAppointmentCheckout = catchAsync(async (req, res) => {
  const prepared = await appointmentService.prepareAppointmentCheckout(req.body);

  const sessionId = await PaymentService.createPayment({
    userId: prepared.patientId,
    email: prepared.patientEmail,
    items: [
      {
        type: "appointment",
        doctorId: prepared.doctor._id.toString(),
        title: `Consultation with ${prepared.doctor.name}`,
        price: prepared.doctor.consultationFee,
        quantity: 1,
        appointmentDate: prepared.appointmentDate.toISOString(),
        appointmentTime: prepared.appointmentTime,
        reason: prepared.reason,
      },
    ],
    metadata: {
      bookingType: "appointment",
      doctorId: prepared.doctor._id.toString(),
      appointmentDate: prepared.appointmentDate.toISOString(),
      appointmentTime: prepared.appointmentTime,
      reason: prepared.reason,
    },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Checkout session created successfully",
    data: { id: sessionId },
  });
});

const getAppointmentsByPatient = catchAsync(async (req, res) => {
  const { patientId } = req.params;
  const result = await appointmentService.getAppointmentsByPatient(patientId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

const cancelAppointment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const { patientId } = req.body;

  const result = await appointmentService.cancelAppointment(
    appointmentId,
    patientId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Appointment cancelled successfully",
    data: result,
  });
});

const rescheduleAppointment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;

  const result = await appointmentService.rescheduleAppointment(
    appointmentId,
    req.body
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Appointment rescheduled successfully",
    data: result,
  });
});

export const appointmentController = {
  initiateAppointmentCheckout,
  getAppointmentsByPatient,
  cancelAppointment,
  rescheduleAppointment,
};
