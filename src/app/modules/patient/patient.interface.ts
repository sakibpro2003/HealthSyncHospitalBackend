import { Document } from "mongoose";

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IPatient extends Document {
  name: string;
  role:string,
  email?: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address: string;
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  maritalStatus?: "single" | "married" | "divorced" | "widowed";
  emergencyContact?: IEmergencyContact;
  occupation?: string;
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  createdBy: string; // receptionist or admin ID
  createdAt?: Date;
  updatedAt?: Date;
}
