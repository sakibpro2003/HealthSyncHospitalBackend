import { model, Schema } from "mongoose";
import type { ICart } from "./cart.interface";
// import { ICart } from "./cart.interface";

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number },
    image: { type: String },
    totalPrice: { type: Number, required: true, default: 0 },
    isPrescriptionSubmitted: { type: Boolean, require: false, default: false },
  },
  {
    timestamps: true,
  }
);

const Cart = model<ICart>("Cart", cartSchema);
export default Cart;
