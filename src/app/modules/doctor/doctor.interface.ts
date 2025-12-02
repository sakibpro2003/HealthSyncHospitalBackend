export interface IDoctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  consultationFee:number;
  image:string,
  specialization: string;
  education: string[]; // e.g., ["MBBS - Dhaka Medical College", "FCPS - BIRDEM"]
  availability: {
    days: string[]; // e.g., ["Sunday", "Tuesday", "Thursday"]
    from: string;   // e.g., "09:00 AM"
    to: string;     // e.g., "05:00 PM"
  };
  experience?: string; // e.g., "5 years in Internal Medicine"
  bio?: string;        // A short professional summary about the doctor
  password?: string;   // Hashed password stored securely (never exposed via API)
  createdAt?: string;
  updatedAt?: string;
}
