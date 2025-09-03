import Cart from "./cart.model";
import httpStatus from "http-status";

import { TCartPayload } from "../../types/cartPayload.types";
import mongoose, { ObjectId, Types } from "mongoose";
import Product from "../products/product.model";
import AppError from "../../app/error/AppError";
import { TUser } from "../../types/user";

const addToCart = async ({
  payload,
  user,
}: {
  payload: TCartPayload;
  user: ObjectId;
}) => {
  const cartData = { ...payload, user };
  const res = await Cart.create(cartData);

  return res;
};
const increaseAmountIntoDb = async ({
  userId,
  objectProductId,
}: {
  userId: mongoose.Types.ObjectId;
  objectProductId: mongoose.Types.ObjectId;
}) => {
  const product = await Product.findById(objectProductId);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  // const maxQuantity = product.quantity;
  const updatedCart = await Cart.findOneAndUpdate(
    { user: userId, product: objectProductId},
    { $inc: { quantity: 1 } },
    { new: true }
  );

  return updatedCart;
};
const decreaseAmountIntoDb = async ({
  userId,
  objectProductId,
}: {
  userId: mongoose.Types.ObjectId;
  objectProductId: mongoose.Types.ObjectId;
}) => {
  const updatedCart = await Cart.findOneAndUpdate(
    { user: userId, product: objectProductId, quantity: { $gt: 1 } },
    { $inc: { quantity: -1 } },
    { new: true }
  );

  return updatedCart;
};

//Clear cart logic
const clearCart = async (id: string) => {
  const getCart = await Cart.deleteOne({ user: id });
  return clearCart;
};

const getAllProductsFromCartService = async (user:TUser) => {
  const res = await Cart.find({ user }).populate("product");
  return res;
};


const removeItemFromCartDb = async (_id: string, user: TUser) => {
  try {
    const objectId = new mongoose.Types.ObjectId(_id);
    const userId = new mongoose.Types.ObjectId(user._id); // ✅ Pass user._id instead of the entire user object

    const find = await Cart.findOne({ user: userId, _id: objectId });

    const res = await Cart.findOneAndDelete({ _id: objectId, user: userId });

    return res;
  } catch (error) {
    console.error("Error removing item:", error);
    throw error;
  }
};




export const cartServices = {
  addToCart,
  clearCart,
  removeItemFromCartDb,
  getAllProductsFromCartService,
  increaseAmountIntoDb,
  decreaseAmountIntoDb,

};

