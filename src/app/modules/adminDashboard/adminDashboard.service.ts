import Payment from "../payment/payment.model";
import { Doctor } from "../doctor/doctor.model";
import { BloodInventory } from "../bloodBank/bloodBank.model";

const calculateSalesBreakdown = async () => {
  const baseMatch = { status: "paid" };

  const totals = await Payment.aggregate([
    { $match: baseMatch },
    { $unwind: "$items" },
    {
      $addFields: {
        itemTotal: {
          $multiply: ["$items.price", { $ifNull: ["$items.quantity", 1] }],
        },
      },
    },
    {
      $group: {
        _id: "$items.type",
        totalAmount: { $sum: "$itemTotal" },
        totalItems: { $sum: { $ifNull: ["$items.quantity", 1] } },
        transactions: {
          $push: {
            paymentId: "$_id",
            title: "$items.title",
            amount: "$itemTotal",
            quantity: { $ifNull: ["$items.quantity", 1] },
            createdAt: "$createdAt",
          },
        },
      },
    },
  ]);

  const recentByType = await Payment.aggregate([
    { $match: baseMatch },
    { $unwind: "$items" },
    {
      $addFields: {
        itemTotal: {
          $multiply: ["$items.price", { $ifNull: ["$items.quantity", 1] }],
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$items.type",
        transactions: {
          $push: {
            paymentId: "$_id",
            title: "$items.title",
            amount: "$itemTotal",
            quantity: { $ifNull: ["$items.quantity", 1] },
            createdAt: "$createdAt",
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        transactions: { $slice: ["$transactions", 8] },
      },
    },
  ]);

  const appointmentByDoctor = await Payment.aggregate([
    { $match: baseMatch },
    { $unwind: "$items" },
    { $match: { "items.type": "appointment", "items.doctorId": { $nin: [null, ""] } } },
    {
      $addFields: {
        itemTotal: {
          $multiply: ["$items.price", { $ifNull: ["$items.quantity", 1] }],
        },
        doctorRef: {
          $cond: [
            { $eq: [{ $type: "$items.doctorId" }, "string"] },
            { $toObjectId: "$items.doctorId" },
            "$items.doctorId",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$doctorRef",
        totalAppointments: { $sum: 1 },
        totalAmount: { $sum: "$itemTotal" },
      },
    },
    { $match: { _id: { $ne: null } } },
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $addFields: {
        doctor: { $first: "$doctor" },
      },
    },
    {
      $project: {
        _id: 0,
        doctorId: { $ifNull: ["$doctor._id", "$_id"] },
        doctorName: { $ifNull: ["$doctor.name", "Unknown Doctor"] },
        department: "$doctor.department",
        totalAppointments: 1,
        totalAmount: 1,
      },
    },
    { $sort: { totalAppointments: -1 } },
  ]);

  const breakdown: Record<string, any> = {};

  totals.forEach((entry) => {
    breakdown[entry._id] = {
      totalAmount: entry.totalAmount,
      totalItems: entry.totalItems,
    };
  });

  recentByType.forEach((entry) => {
    if (!breakdown[entry._id]) {
      breakdown[entry._id] = { totalAmount: 0, totalItems: 0 };
    }
    breakdown[entry._id].recent = entry.transactions;
  });

  return {
    breakdown,
    appointmentByDoctor,
  };
};

const getDonationHistory = async () => {
  const inventories = await BloodInventory.find()
    .select("bloodGroup unitsAvailable history updatedAt")
    .lean();

  const totalsByGroup = inventories.map((inventory) => {
    const donationEvents = (inventory.history ?? []).filter(
      (entry) => entry.change > 0
    );

    const lastDonation = donationEvents
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
      )[0];

    return {
      bloodGroup: inventory.bloodGroup,
      totalQuantity: inventory.unitsAvailable,
      donors: donationEvents.length,
      lastDonation: lastDonation?.createdAt ?? null,
    };
  });

  const recentDonations = inventories
    .flatMap((inventory) =>
      (inventory.history ?? [])
        .filter((entry) => entry.change > 0)
        .map((entry) => ({
          _id: entry._id?.toString() ?? `${inventory._id}-${entry.createdAt}`,
          name: entry.actorName ?? "Anonymous",
          bloodGroup: inventory.bloodGroup,
          quantity: entry.change,
          lastDonationDate: entry.createdAt,
          createdAt: entry.createdAt ?? inventory.updatedAt ?? new Date(),
        }))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 10);

  return {
    totalsByGroup,
    recentDonations,
  };
};

export const adminDashboardService = {
  calculateSalesBreakdown,
  getDonationHistory,
};
