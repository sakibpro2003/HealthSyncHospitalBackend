import Payment from "../payment/payment.model";
import { Donor } from "../donor/donor.model";
import { Doctor } from "../doctor/doctor.model";

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
  const totalsByGroup = await Donor.aggregate([
    {
      $group: {
        _id: "$bloodGroup",
        totalQuantity: { $sum: "$quantity" },
        donors: { $sum: 1 },
        lastDonation: { $max: "$lastDonationDate" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        bloodGroup: "$_id",
        totalQuantity: 1,
        donors: 1,
        lastDonation: 1,
      },
    },
  ]);

  const recentDonations = await Donor.find()
    .select("name bloodGroup quantity lastDonationDate createdAt")
    .sort({ lastDonationDate: -1, createdAt: -1 })
    .limit(10)
    .lean();

  return {
    totalsByGroup,
    recentDonations,
  };
};

export const adminDashboardService = {
  calculateSalesBreakdown,
  getDonationHistory,
};
