import Cart from "./cart.model";
import httpStatus from "http-status";
import mongoose from "mongoose";
import Product from "../products/product.model";
import AppError from "../../errors/appError";

type CartPayload = {
  product: string;
  quantity?: number;
  image?: string;
  totalPrice?: number;
  isPrescriptionSubmitted?: boolean;
};

type CartUserRef = {
  _id: mongoose.Types.ObjectId | string;
};

const addToCart = async ({
  payload,
  user,
}: {
  payload: CartPayload;
  user: mongoose.Types.ObjectId;
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

  const updatedCart = await Cart.findOneAndUpdate(
    { user: userId, product: objectProductId },
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

const clearCart = async (id: string) => {
  const result = await Cart.deleteOne({ user: id });
  return result;
};

const getAllProductsFromCartService = async (user: CartUserRef) => {
  const userObjectId = new mongoose.Types.ObjectId(user._id);
  const res = await Cart.find({ user: userObjectId }).populate("product");
  return res;
};

const removeItemFromCartDb = async (_id: string, user: CartUserRef) => {
  try {
    const objectId = new mongoose.Types.ObjectId(_id);
    const userId = new mongoose.Types.ObjectId(user._id);

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
