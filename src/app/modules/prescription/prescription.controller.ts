import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PrescriptionService } from "./prescription.service";
import type { IPrescription } from "./prescription.interface";
import AppError from "../../errors/appError";
import PDFDocument from "pdfkit";

const createPrescription = catchAsync(async (req, res) => {
  const { user } = req;

  if (!user || user.role !== "doctor") {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Only doctors can create prescriptions"
    );
  }

  const payload = req.body as Omit<
    IPrescription,
    "_id" | "doctor" | "patient"
  >;

  const result = await PrescriptionService.createPrescription(
    user.userId,
    payload
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
});

const getDoctorPrescriptions = catchAsync(async (req, res) => {
  const { user } = req;

  if (!user || user.role !== "doctor") {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Only doctors can view their prescriptions"
    );
  }

  const result = await PrescriptionService.getPrescriptionsForDoctor(
    user.userId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Prescriptions retrieved successfully",
    data: result,
  });
});

const getPatientPrescriptions = catchAsync(async (req, res) => {
  const { patientId } = req.params as { patientId?: string };
  const { user } = req;

  if (!patientId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Patient id is required");
  }

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
  }

  const isSamePatient = patientId === user.userId;
  const isDoctor = user.role === "doctor";
  const isAdmin = user.role === "admin";
  const isReceptionist = user.role === "receptionist";

  if (!isSamePatient && !isDoctor && !isAdmin && !isReceptionist) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized to view these prescriptions"
    );
  }

  const result = await PrescriptionService.getPrescriptionsForPatient(
    patientId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Prescriptions retrieved successfully",
    data: result,
  });
});

const downloadPrescription = catchAsync(async (req, res) => {
  const { prescriptionId } = req.params as { prescriptionId?: string };
  const { user } = req;

  if (!prescriptionId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Prescription id is required");
  }

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
  }

  const prescription = await PrescriptionService.getPrescriptionById(
    prescriptionId,
    { role: user.role, userId: user.userId }
  );

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=prescription-${prescription._id}.pdf`
  );

  const formatDisplayDate = (value?: Date | string | null) => {
    if (!value) {
      return "-";
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const drawSectionHeading = (docInstance: PDFDocument, title: string) => {
    docInstance.moveDown(0.75);
    docInstance
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f172a")
      .text(title.toUpperCase());

    const lineY = docInstance.y + 4;
    docInstance
      .strokeColor("#cbd5f5")
      .lineWidth(1)
      .moveTo(docInstance.page.margins.left, lineY)
      .lineTo(docInstance.page.width - docInstance.page.margins.right, lineY)
      .stroke()
      .moveDown(0.4);

    docInstance.strokeColor("#0f172a").lineWidth(1).fillColor("#0f172a");
  };

  const writeField = (
    docInstance: PDFDocument,
    label: string,
    value?: string | null
  ) => {
    if (!value) {
      return;
    }

    docInstance
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f172a")
      .text(label);
    docInstance.moveDown(0.15);
    docInstance
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#1e293b")
      .text(value, {
        width:
          docInstance.page.width -
          docInstance.page.margins.left -
          docInstance.page.margins.right,
        lineGap: 4,
      })
      .moveDown(0.5);
  };

  const doc = new PDFDocument({
    size: "A4",
    margin: 56,
    bufferPages: true,
  });
  doc.info.Title = `Prescription ${prescription._id}`;
  doc.info.Author = "HealthSync Hospital";

  doc.pipe(res);

  const contentWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc
    .fillColor("#1d4ed8")
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("HealthSync Hospital");
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#475569")
    .text("123 Wellness Boulevard, Springfield, USA 12345");
  doc
    .text("Phone: +1 (555) 123-4567  |  Email: care@healthsynchospital.com")
    .moveDown(0.6);

  doc
    .fillColor("#0f172a")
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Prescription");

  const headerRuleY = doc.y + 6;
  doc
    .strokeColor("#1d4ed8")
    .lineWidth(2)
    .moveTo(doc.page.margins.left, headerRuleY)
    .lineTo(doc.page.width - doc.page.margins.right, headerRuleY)
    .stroke()
    .moveDown(1.2);

  doc.strokeColor("#0f172a").lineWidth(1);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#334155")
    .text(`Prescription ID: ${prescription._id}`);
  doc
    .text(`Issued on: ${formatDisplayDate(prescription.createdAt)}`)
    .moveDown(0.6);

  const doctorInfo = (prescription as unknown as { doctor?: { name?: string; email?: string } }).doctor;
  const patientInfo = (prescription as unknown as { patient?: { name?: string; email?: string } }).patient;

  const baseY = doc.y;
  const columnWidth = contentWidth / 2 - 15;
  const rightColumnX = doc.page.margins.left + columnWidth + 30;

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#0f172a")
    .text("Doctor", doc.page.margins.left, baseY);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#1e293b")
    .text(doctorInfo?.name ?? "N/A", doc.page.margins.left, doc.y, {
      width: columnWidth,
      lineGap: 2,
    });
  if (doctorInfo?.email) {
    doc
      .fillColor("#475569")
      .text(doctorInfo.email, doc.page.margins.left, doc.y, {
        width: columnWidth,
      });
  }
  const doctorBottom = doc.y;

  doc.y = baseY;
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#0f172a")
    .text("Patient", rightColumnX, baseY);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#1e293b")
    .text(patientInfo?.name ?? "N/A", rightColumnX, doc.y, {
      width: columnWidth,
      lineGap: 2,
    });
  if (patientInfo?.email) {
    doc
      .fillColor("#475569")
      .text(patientInfo.email, rightColumnX, doc.y, {
        width: columnWidth,
      });
  }
  const patientBottom = doc.y;

  doc.y = Math.max(doctorBottom, patientBottom);
  doc.moveDown(0.8);

  drawSectionHeading(doc, "Clinical Summary");
  writeField(doc, "Diagnosis", prescription.diagnosis);
  writeField(doc, "Presenting Complaints", prescription.complaints);

  drawSectionHeading(doc, "Treatment Plan");
  if (prescription.medications && prescription.medications.length > 0) {
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f172a")
      .text("Medications");
    doc.moveDown(0.2);
    prescription.medications.forEach((item) => {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#1e293b")
        .text(`• ${item}`, {
          width: contentWidth,
          indent: 12,
          lineGap: 4,
        });
    });
    doc.moveDown(0.6);
  }
  writeField(doc, "Advice & Instructions", prescription.advice);

  drawSectionHeading(doc, "Follow-up");
  writeField(
    doc,
    "Follow-up Date",
    prescription.followUpDate ? formatDisplayDate(prescription.followUpDate) : null
  );
  writeField(doc, "Additional Notes", prescription.notes);

  doc.moveDown(1.8);
  const signatureLineWidth = 180;
  const signatureStartX =
    doc.page.width - doc.page.margins.right - signatureLineWidth;
  const signatureY = doc.y;

  doc
    .strokeColor("#94a3b8")
    .lineWidth(1)
    .moveTo(signatureStartX, signatureY)
    .lineTo(signatureStartX + signatureLineWidth, signatureY)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#475569")
    .text("Doctor Signature", signatureStartX, signatureY + 4, {
      width: signatureLineWidth,
      align: "center",
    });

  doc.moveDown(2);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#94a3b8")
    .text(
      "This prescription was generated electronically via the HealthSync Hospital platform. Contact the issuing doctor for clarifications or adjustments.",
      doc.page.margins.left,
      doc.y,
      {
        width: contentWidth,
        align: "center",
      }
    );

  doc.end();
});

export const PrescriptionController = {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  downloadPrescription,
};
