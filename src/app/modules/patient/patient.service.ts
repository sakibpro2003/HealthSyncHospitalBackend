import { Patient } from "./patient.model";

const registerPatient = async (patientPayload) => {
  const result = await Patient.create(patientPayload);
  return result;
};
const deletePatient = async (_id) => {
  const result = await Patient.deleteOne(_id);
  return result;
};

export const PatientService = {
  registerPatient,
  deletePatient,
};
