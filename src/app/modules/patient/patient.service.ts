import { Patient } from "./patient.model";

const registerPatient = async (patientPayload) => {
  const result = await Patient.create(patientPayload);
  return result;
};

export const PatientService = {
  registerPatient,
};
