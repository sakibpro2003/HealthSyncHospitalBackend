import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { appointmentService } from "./appointment.service";

const createAppointment = catchAsync(async (req, res) => {
  const result = await appointmentService.createAppointment(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Appointment booked successfully",
    data: result,
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

export const appointmentController = {
  createAppointment,
  getAppointmentsByPatient,
};
