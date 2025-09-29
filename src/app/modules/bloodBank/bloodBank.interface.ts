import type { Types, Document } from "mongoose";
import type {
  TBloodGroup,
  TBloodRequestPriority,
  TBloodRequestStatus,
} from "./bloodBank.constants";

export type TBloodInventoryHistoryType =
  | "restock"
  | "donation"
  | "request-fulfillment"
  | "adjustment";

export interface IBloodInventoryHistoryEntry {
  change: number;
  balanceAfter: number;
  type: TBloodInventoryHistoryType;
  note?: string;
  referenceId?: Types.ObjectId;
  actorId?: Types.ObjectId;
  actorName?: string;
  actorRole?: string;
  createdAt?: Date;
}

export interface IBloodInventory extends Document {
  bloodGroup: TBloodGroup;
  unitsAvailable: number;
  minimumThreshold?: number;
  notes?: string;
  lastRestockedAt?: Date;
  history: IBloodInventoryHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBloodRequest extends Document {
  bloodGroup: TBloodGroup;
  unitsRequested: number;
  status: TBloodRequestStatus;
  priority: TBloodRequestPriority;
  reason?: string;
  neededOn?: Date;
  requesterName: string;
  requesterEmail?: string;
  requesterPhone?: string;
  patientId?: Types.ObjectId;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  fulfilledAt?: Date;
  notes?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdjustInventoryPayload {
  inventoryId?: string;
  bloodGroup?: TBloodGroup;
  adjustBy: number;
  note?: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  type?: TBloodInventoryHistoryType;
}

export interface ICreateInventoryPayload {
  bloodGroup: TBloodGroup;
  unitsAvailable: number;
  minimumThreshold?: number;
  notes?: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
}

export interface IUpdateInventoryPayload {
  unitsAvailable?: number;
  adjustBy?: number;
  minimumThreshold?: number;
  notes?: string;
  note?: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  type?: TBloodInventoryHistoryType;
}

export interface ICreateBloodRequestPayload {
  bloodGroup: TBloodGroup;
  unitsRequested: number;
  reason?: string;
  neededOn?: Date | string;
  priority?: TBloodRequestPriority;
  requesterName: string;
  requesterEmail?: string;
  requesterPhone?: string;
  patientId?: string;
}

export interface IUpdateBloodRequestStatusPayload {
  status: Extract<TBloodRequestStatus, "approved" | "rejected" | "fulfilled" | "cancelled">;
  notes?: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  rejectionReason?: string;
}
