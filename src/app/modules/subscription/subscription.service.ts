import mongoose from "mongoose";
import type { ISubscription } from "./subscription.interface";
import { HealthPackage } from "../healthPackage/healthPackage.model";
import { Subscription } from "./subscription.model";

export const createSubscription = async (
  patientId: string,
  packageId: string,
  autoRenew: boolean
): Promise<ISubscription> => {
  const healthPackage = await HealthPackage.findById(packageId);
  if (!healthPackage) {
    throw new Error("Health package not found");
  }

  const startDate = new Date();
  const endDate = new Date(
    startDate.getTime() + healthPackage.durationInDays * 24 * 60 * 60 * 1000
  );

  const subscription = await Subscription.create({
    patient: new mongoose.Types.ObjectId(patientId),
    package: new mongoose.Types.ObjectId(packageId),
    startDate,
    endDate,
    autoRenew,
  });

  return subscription;
};

export const getSubscriptionsByPatient = async (
  patientId: string
): Promise<ISubscription[]> => {
  return Subscription.find({ patient: patientId })
    .populate("package")
    .sort({ startDate: -1 })
    .populate("patient", "-password -__v")
    .populate("package", "-__v");
};

export const cancelSubscription = async (
  subscriptionId: string
): Promise<ISubscription | null> => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  subscription.status = "cancelled";
  await subscription.save();
  return subscription;
};


// TODO:auto renew subscription
// export const updateSubscriptionStatus = async (): Promise<void> => {
//   const today = new Date();
//   const expiredSubs = await Subscription.find({
//     status: "active",
//     endDate: { $lt: today },
//   });

//   for (const sub of expiredSubs) {
//     if (sub.autoRenew) {
//       const healthPackage = await HealthPackage.findById(sub.package);
//       if (healthPackage) {
//         sub.startDate = today;
//         sub.endDate = new Date(
//           today.getTime() + healthPackage.durationInDays * 24 * 60 * 60 * 1000
//         );
//       }
//     } else {
//       sub.status = "expired";
//     }
//     await sub.save();
//   }
// };

export const subscriptionService = {
  createSubscription,
  getSubscriptionsByPatient,
  cancelSubscription,
  // updateSubscriptionStatus,
};
