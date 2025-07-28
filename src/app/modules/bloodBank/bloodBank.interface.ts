export type IBloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export interface IBlodBank {
  donorName: string;
  donorAddress: string;
  donorPhone: string;
  donorEmail: string;
  donatedBlood: IBloodGroup;
}
