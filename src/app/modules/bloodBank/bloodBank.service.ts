import { Donor } from "../donor/donor.model";
import { BloodBank } from "./bloodBank.model";

const getAvailableBloodQuantity = async () => {
  const result = await Donor.aggregate([
    {
      $group: {
        _id: "$bloodGroup",
        totalQuantity: { $sum: "$quantity" },
      },
    },
    {
      $project: {
        bloodGroup: "$_id",
        totalQuantity: 1,
        _id: 1,
      },
    },
  ]);

  const stockMap: Record<string, number> = {};

  result.forEach((item) => {
    stockMap[item.bloodGroup] = item.totalQuantity;
  });

  return stockMap;
};

const donateBlood = async (recieiverData) => {
  console.log(recieiverData);
  const result = await BloodBank.create(recieiverData);
  return recieiverData;
};

export const BloodBankService = {
  getAvailableBloodQuantity,
  donateBlood,
};
