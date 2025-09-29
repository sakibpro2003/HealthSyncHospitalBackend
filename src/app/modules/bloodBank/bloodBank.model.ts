import { Schema, model } from "mongoose";
import {
  BLOOD_GROUPS,
  BLOOD_REQUEST_PRIORITY,
  BLOOD_REQUEST_STATUS,
} from "./bloodBank.constants";
import type { IBloodInventory, IBloodRequest } from "./bloodBank.interface";

const bloodInventoryHistorySchema = new Schema(
  {
    change: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["restock", "donation", "request-fulfillment", "adjustment"],
      required: true,
    },
    note: {
      type: String,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actorName: {
      type: String,
    },
    actorRole: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
    id: true,
  }
);

const bloodInventorySchema = new Schema<IBloodInventory>(
  {
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    unitsAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minimumThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
    },
    lastRestockedAt: {
      type: Date,
    },
    history: {
      type: [bloodInventoryHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const bloodRequestSchema = new Schema<IBloodRequest>(
  {
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
      uppercase: true,
      trim: true,
    },
    unitsRequested: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: BLOOD_REQUEST_STATUS,
      default: "pending",
    },
    priority: {
      type: String,
      enum: BLOOD_REQUEST_PRIORITY,
      default: "medium",
    },
    reason: {
      type: String,
    },
    neededOn: {
      type: Date,
    },
    requesterName: {
      type: String,
      required: true,
      trim: true,
    },
    requesterEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    requesterPhone: {
      type: String,
      trim: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
    fulfilledAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

bloodRequestSchema.index({ status: 1, bloodGroup: 1, createdAt: -1 });
bloodRequestSchema.index({ requesterEmail: 1, createdAt: -1 });
bloodRequestSchema.index({ requesterPhone: 1, createdAt: -1 });

export const BloodInventory = model<IBloodInventory>(
  "BloodInventory",
  bloodInventorySchema
);
export const BloodRequest = model<IBloodRequest>("BloodRequest", bloodRequestSchema);
