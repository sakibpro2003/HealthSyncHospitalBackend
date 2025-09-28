import { Donor } from "../donor/donor.model";
import { BloodBank } from "./bloodBank.model";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const normaliseQuantity = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
};

const mergeIntoSummary = (
  summary: Record<string, number>,
  entries: Iterable<[string, unknown]>
) => {
  for (const [group, qty] of entries) {
    if (group && Object.prototype.hasOwnProperty.call(summary, group)) {
      summary[group] += normaliseQuantity(qty);
    }
  }
};

const getAvailableBloodQuantity = async () => {
  const summary: Record<string, number> = BLOOD_GROUPS.reduce(
    (acc, group) => ({ ...acc, [group]: 0 }),
    {} as Record<string, number>
  );

  const bankRecords = await BloodBank.find().lean();
  bankRecords.forEach((record: any) => {
    const available = record?.availableBlood;
    if (!available) return;
    if (available instanceof Map) {
      mergeIntoSummary(summary, available.entries());
    } else if (typeof available === "object") {
      mergeIntoSummary(summary, Object.entries(available));
    }
  });

  const hasStock = Object.values(summary).some((qty) => qty > 0);
  if (!hasStock) {
    const donorAggregate = await Donor.aggregate([
      {
        $group: {
          _id: "$bloodGroup",
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    donorAggregate.forEach((item) => {
      const group = item?._id;
      if (group && Object.prototype.hasOwnProperty.call(summary, group)) {
        summary[group] = normaliseQuantity(item.totalQuantity);
      }
    });
  }

  return summary;
};

const donateBlood = async (receiverData: Record<string, unknown>) => {
  await BloodBank.create(receiverData);
  return receiverData;
};

export const BloodBankService = {
  getAvailableBloodQuantity,
  donateBlood,
};
