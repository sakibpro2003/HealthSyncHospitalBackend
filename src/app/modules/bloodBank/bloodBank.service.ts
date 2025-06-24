import { Donor } from "../donor/donor.model";

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
        _id: 0,
      },
    },
  ]);
//   return result;

const stockMap: Record<string, number> = {}; // ✅ Declare first

result.forEach(item => {
  stockMap[item.bloodGroup] = item.totalQuantity; // ✅ Then use it
});


  return stockMap;
};

export const BloodBankService = {
    getAvailableBloodQuantity,
}
