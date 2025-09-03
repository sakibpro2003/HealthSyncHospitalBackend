import { Document, Types } from "mongoose";
import type IProduct from "../products/product.interface";
import type { IUser } from "../user/user.interface";
// import { TUser } from "../User/user.interface";
// import IProduct from "../products/product.interface";

export interface ICartItem {
  product: Types.ObjectId | IProduct;
  quantity: number;
  // isPrescriptionSubmitted: boolean;
}

export interface ICart extends Document {
  user: Types.ObjectId | IUser;
  product:Types.ObjectId;
  quantity:number;
  image:string;
  isPrescriptionSubmitted?:boolean;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}
