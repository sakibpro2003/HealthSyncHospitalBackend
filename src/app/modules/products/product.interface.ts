import { Document } from "mongoose";

export default interface IProduct extends Document {
  name: string;
  description: string;
  image: string;
  price: number;
  inStock: boolean;
  quantity: number;
  rating: number;
  dosage: string;
  discount: number;
  packSize: string;
  requiredPrescription: boolean;
  expiryDate: Date;
  category: "Painkiller" | "Antibiotic" | "Cold" | "Vitamin" | "Antacid";
  form: "Tablet" | "Syrup" | "Injection" | "Ointment";
  manufacturer: {
    name: string;
    address?: string;
    contact?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// export default IProduct;
