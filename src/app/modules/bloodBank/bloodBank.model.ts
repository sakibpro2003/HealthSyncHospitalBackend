import mongoose from "mongoose";

const bloodBankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      address: String,
      city: String,
      district: String,
      division: String,
    //   coordinates: {
    //     lat: Number,
    //     lng: Number,
    //   },
    },
    contactNumber: {
      type: String,
      required: true,
    //   match: /^[0-9]{10,15}$/,
    },
    email: {
      type: String,
      unique: true,
    },
    availableBlood: {
      type: Map,
      of: Number, // e.g., { "A+": 10, "O-": 5 }
    },
  },
  {
    timestamps: true,
  }
);

export const BloodBank = mongoose.model("BloodBank", bloodBankSchema);
module.exports = BloodBank;
