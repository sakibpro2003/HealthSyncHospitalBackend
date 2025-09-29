export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const BLOOD_REQUEST_STATUS = [
  "pending",
  "approved",
  "rejected",
  "fulfilled",
  "cancelled",
] as const;

export const BLOOD_REQUEST_PRIORITY = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type TBloodGroup = (typeof BLOOD_GROUPS)[number];
export type TBloodRequestStatus = (typeof BLOOD_REQUEST_STATUS)[number];
export type TBloodRequestPriority = (typeof BLOOD_REQUEST_PRIORITY)[number];
