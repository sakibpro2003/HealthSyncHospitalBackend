import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import type {
  IAdjustInventoryPayload,
  ICreateBloodRequestPayload,
  ICreateInventoryPayload,
  IUpdateBloodRequestStatusPayload,
  IUpdateInventoryPayload,
} from "./bloodBank.interface";
import { BloodInventory, BloodRequest } from "./bloodBank.model";
import { BLOOD_GROUPS } from "./bloodBank.constants";

const normalizeBloodGroup = (group: string | undefined) => {
  if (!group) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Blood group is required");
  }
  const normalized = group.trim().toUpperCase();
  if (!BLOOD_GROUPS.includes(normalized as (typeof BLOOD_GROUPS)[number])) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid blood group provided");
  }
  return normalized;
};

const toObjectId = (value?: string): mongoose.Types.ObjectId | undefined => {
  if (!value) return undefined;
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : undefined;
};

const createInventory = async (payload: ICreateInventoryPayload) => {
  const bloodGroup = normalizeBloodGroup(payload.bloodGroup);
  const existing = await BloodInventory.findOne({ bloodGroup });
  if (existing) {
    throw new AppError(
      StatusCodes.CONFLICT,
      `Inventory already exists for ${bloodGroup}`
    );
  }

  const units = Math.max(0, Number(payload.unitsAvailable ?? 0));
  const historyEntries = units
    ? [
        {
          change: units,
          balanceAfter: units,
          type: "restock" as const,
          note: payload.notes ?? "Initial stock",
          actorId: toObjectId(payload.actorId),
          actorName: payload.actorName,
          actorRole: payload.actorRole,
        },
      ]
    : [];

  const inventory = await BloodInventory.create({
    bloodGroup,
    unitsAvailable: units,
    minimumThreshold: Math.max(0, Number(payload.minimumThreshold ?? 0)),
    notes: payload.notes,
    lastRestockedAt: units ? new Date() : undefined,
    history: historyEntries,
  });

  return inventory;
};

const getInventories = async () => {
  const inventories = await BloodInventory.find().sort({ bloodGroup: 1 }).lean();
  return inventories;
};

const getInventorySummary = async () => {
  const inventories = await BloodInventory.find()
    .select("bloodGroup unitsAvailable")
    .lean();

  const summary: Record<string, number> = {};
  inventories.forEach((item) => {
    summary[item.bloodGroup] = item.unitsAvailable;
  });

  return summary;
};

const updateInventory = async (
  inventoryId: string,
  payload: IUpdateInventoryPayload
) => {
  const inventory = await BloodInventory.findById(inventoryId);
  if (!inventory) {
    throw new AppError(StatusCodes.NOT_FOUND, "Inventory record not found");
  }

  let change = 0;
  if (typeof payload.adjustBy === "number") {
    change = Number(payload.adjustBy);
  } else if (typeof payload.unitsAvailable === "number") {
    change = Number(payload.unitsAvailable) - inventory.unitsAvailable;
    inventory.unitsAvailable = Math.max(0, Number(payload.unitsAvailable));
  }

  if (typeof payload.adjustBy === "number") {
    const nextUnits = inventory.unitsAvailable + change;
    if (nextUnits < 0) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Adjustment would result in negative stock"
      );
    }
    inventory.unitsAvailable = nextUnits;
  }

  if (payload.minimumThreshold !== undefined) {
    inventory.minimumThreshold = Math.max(0, Number(payload.minimumThreshold));
  }

  if (payload.notes !== undefined) {
    inventory.notes = payload.notes;
  }

  if (change !== 0) {
    const type =
      payload.type ?? (change > 0 ? "restock" : "adjustment" as const);
    inventory.history.push({
      change,
      balanceAfter: inventory.unitsAvailable,
      type,
      note: payload.note ?? payload.notes,
      actorId: toObjectId(payload.actorId),
      actorName: payload.actorName,
      actorRole: payload.actorRole,
    });
    if (change > 0) {
      inventory.lastRestockedAt = new Date();
    }
  }

  await inventory.save();
  return inventory;
};

const adjustInventory = async (payload: IAdjustInventoryPayload) => {
  if (!payload.inventoryId && !payload.bloodGroup) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Either inventoryId or bloodGroup must be provided"
    );
  }

  if (typeof payload.adjustBy !== "number" || payload.adjustBy === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Adjustment amount must be a non-zero number"
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let inventory = payload.inventoryId
      ? await BloodInventory.findById(payload.inventoryId).session(session)
      : await BloodInventory.findOne({
          bloodGroup: normalizeBloodGroup(payload.bloodGroup),
        }).session(session);

    if (!inventory) {
      if (!payload.bloodGroup) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          "Inventory record not found"
        );
      }
      inventory = new BloodInventory({
        bloodGroup: normalizeBloodGroup(payload.bloodGroup),
        unitsAvailable: 0,
        minimumThreshold: 0,
        history: [],
      });
      inventory.$session(session);
    }

    const change = Number(payload.adjustBy);
    const nextUnits = inventory.unitsAvailable + change;
    if (nextUnits < 0) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Adjustment would result in negative stock"
      );
    }

    inventory.unitsAvailable = nextUnits;
    if (change > 0) {
      inventory.lastRestockedAt = new Date();
    }

    inventory.history.push({
      change,
      balanceAfter: inventory.unitsAvailable,
      type: payload.type ?? (change > 0 ? "restock" : "adjustment"),
      note: payload.note,
      actorId: toObjectId(payload.actorId),
      actorName: payload.actorName,
      actorRole: payload.actorRole,
    });

    await inventory.save({ session });
    await session.commitTransaction();
    return inventory;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deleteInventory = async (inventoryId: string) => {
  const result = await BloodInventory.findByIdAndDelete(inventoryId);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Inventory record not found");
  }
  return result;
};

const createBloodRequest = async (payload: ICreateBloodRequestPayload) => {
  const bloodGroup = normalizeBloodGroup(payload.bloodGroup);
  const unitsRequested = Math.max(1, Number(payload.unitsRequested));

  const request = await BloodRequest.create({
    bloodGroup,
    unitsRequested,
    priority: payload.priority ?? "medium",
    reason: payload.reason,
    neededOn: payload.neededOn ? new Date(payload.neededOn) : undefined,
    requesterName: payload.requesterName,
    requesterEmail: payload.requesterEmail,
    requesterPhone: payload.requesterPhone,
    patientId: toObjectId(payload.patientId),
    status: "pending",
  });

  return request;
};

const getBloodRequests = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};

  if (query?.status && typeof query.status === "string") {
    filter.status = query.status;
  }

  if (query?.bloodGroup && typeof query.bloodGroup === "string") {
    filter.bloodGroup = normalizeBloodGroup(query.bloodGroup);
  }

  if (query?.requesterEmail && typeof query.requesterEmail === "string") {
    filter.requesterEmail = query.requesterEmail.trim().toLowerCase();
  }

  if (query?.requesterPhone && typeof query.requesterPhone === "string") {
    filter.requesterPhone = query.requesterPhone.trim();
  }

  const requests = await BloodRequest.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return requests;
};

const updateBloodRequestStatus = async (
  requestId: string,
  payload: IUpdateBloodRequestStatusPayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await BloodRequest.findById(requestId).session(session);

    if (!request) {
      throw new AppError(StatusCodes.NOT_FOUND, "Blood request not found");
    }

    const actorId = toObjectId(payload.actorId);

    switch (payload.status) {
      case "approved":
      case "fulfilled": {
        if (!["pending", "approved"].includes(request.status)) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Only pending or approved requests can be fulfilled"
          );
        }

        const shouldDeductInventory = request.status === "pending";
        if (shouldDeductInventory) {
          const inventory = await BloodInventory.findOne({
            bloodGroup: request.bloodGroup,
          }).session(session);

          if (!inventory) {
            throw new AppError(
              StatusCodes.BAD_REQUEST,
              `No inventory found for ${request.bloodGroup}`
            );
          }

          if (inventory.unitsAvailable < request.unitsRequested) {
            throw new AppError(
              StatusCodes.BAD_REQUEST,
              `Insufficient stock for ${request.bloodGroup}. Available: ${inventory.unitsAvailable}`
            );
          }

          inventory.unitsAvailable -= request.unitsRequested;
          const requestObjectId =
            request._id instanceof mongoose.Types.ObjectId
              ? request._id
              : new mongoose.Types.ObjectId(
                  (request._id as mongoose.Types.ObjectId | string).toString()
                );

          inventory.history.push({
            change: -request.unitsRequested,
            balanceAfter: inventory.unitsAvailable,
            type: "request-fulfillment",
            note:
              payload.notes ??
              `Released for ${request.requesterName} (${request.unitsRequested} units)`,
            referenceId: requestObjectId,
            actorId,
            actorName: payload.actorName,
            actorRole: payload.actorRole,
          });
          await inventory.save({ session });
        }

        request.status = payload.status === "fulfilled" ? "fulfilled" : "approved";
        request.processedAt = new Date();
        request.processedBy = actorId;
        request.notes = payload.notes ?? request.notes;
        request.rejectionReason = undefined;
        if (payload.status === "fulfilled") {
          request.fulfilledAt = new Date();
        } else if (shouldDeductInventory) {
          request.fulfilledAt = undefined;
        }
        break;
      }
      case "rejected":
      case "cancelled": {
        if (request.status === "approved") {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Approved requests cannot be changed"
          );
        }
        request.status = payload.status;
        request.rejectionReason = payload.rejectionReason ?? payload.notes;
        request.processedAt = new Date();
        request.processedBy = actorId;
        request.notes = payload.notes ?? request.notes;
        break;
      }
      default:
        throw new AppError(StatusCodes.BAD_REQUEST, "Unsupported status update");
    }

    await request.save({ session });
    await session.commitTransaction();
    return request;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getInventoryHistory = async (bloodGroup?: string) => {
  const filter = bloodGroup
    ? { bloodGroup: normalizeBloodGroup(bloodGroup) }
    : undefined;
  const inventories = await BloodInventory.find(filter ?? {})
    .select("bloodGroup history unitsAvailable")
    .lean();
  return inventories;
};

const recordDonation = async (payload: IAdjustInventoryPayload) => {
  const note = payload.note ?? "Donation received";
  return await adjustInventory({
    ...payload,
    note,
    type: payload.type ?? "donation",
  });
};

export const BloodBankService = {
  createInventory,
  getInventories,
  getInventorySummary,
  updateInventory,
  adjustInventory,
  deleteInventory,
  createBloodRequest,
  getBloodRequests,
  updateBloodRequestStatus,
  getInventoryHistory,
  recordDonation,
};
