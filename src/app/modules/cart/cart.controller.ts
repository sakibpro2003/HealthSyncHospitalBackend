import type { Request, Response } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";

import { cartServices } from "./cart.service";
import Cart from "./cart.model";
import Product from "../products/product.model";
import catchAsync from "../../utils/catchAsync";
import { User } from "../user/user.model";
import AppError from "../../errors/appError";

const resolveAuthenticatedUser = async (req: Request) => {
  const email = req.user?.email;

  if (!email) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: User identifier missing in token."
    );
  }

  const userDoc = await User.findOne({ email }).select({ _id: 1 });
  if (!userDoc?._id) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return new mongoose.Types.ObjectId(
    userDoc._id as mongoose.Types.ObjectId | string
  );
};

const parseObjectId = (value: string | undefined, message: string) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, message);
  }
  return new mongoose.Types.ObjectId(value);
};

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userObjectId = await resolveAuthenticatedUser(req);

  const payload = req.body as { product?: string } & Record<string, unknown>;
  if (!payload.product) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product identifier is required");
  }

  const existing = await Cart.findOne({
    user: userObjectId,
    product: payload.product,
  });

  if (existing?._id) {
    throw new AppError(httpStatus.CONFLICT, "Product already added to cart");
  }

  const addItemToCart = await cartServices.addToCart({
    payload,
    user: userObjectId,
  });

  return res.status(httpStatus.CREATED).json({
    success: true,
    message: "Cart created successfully!",
    data: addItemToCart,
  });
});

const increaseAmount = catchAsync(async (req: Request, res: Response) => {
  const userId = await resolveAuthenticatedUser(req);
  const productId = parseObjectId(
    req.params?.productId,
    "Invalid product ID format."
  );

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found in the database");
  }

  const updatedCart = await cartServices.increaseAmountIntoDb({
    userId,
    objectProductId: productId,
  });

  if (!updatedCart) {
    throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Quantity increased successfully!",
    data: updatedCart,
  });
});

const decreaseAmount = catchAsync(async (req: Request, res: Response) => {
  const userId = await resolveAuthenticatedUser(req);
  const productId = parseObjectId(
    req.params?.productId,
    "Invalid product ID format."
  );

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found in the database");
  }

  const updatedCart = await cartServices.decreaseAmountIntoDb({
    userId,
    objectProductId: productId,
  });

  if (!updatedCart) {
    throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Quantity decreased successfully!",
    data: updatedCart,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userEmail = req.user?.email;
  if (!userEmail) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: User email not found."
    );
  }

  const user = await User.findOne({ email: userEmail }).select({ _id: 1 });
  if (!user?._id) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const response = await cartServices.clearCart(user._id.toString());

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Cart cleared successfully!",
    data: response,
  });
});

const getAllProductsFromCart = catchAsync(async (req: Request, res: Response) => {
  const userId = await resolveAuthenticatedUser(req);

  const cartProducts = await cartServices.getAllProductsFromCartService({
    _id: userId,
  });

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Orders retrieved successfully!",
    data: cartProducts,
  });
});

const removeItemController = catchAsync(async (req: Request, res: Response) => {
  const userId = await resolveAuthenticatedUser(req);
  const productId = req.params?.productId;

  if (!productId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product ID is required.");
  }

  const result = await cartServices.removeItemFromCartDb(productId, {
    _id: userId,
  });

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Item removed successfully!",
    data: result,
  });
});

export const cartController = {
  addToCart,
  clearCart,
  removeItemController,
  getAllProductsFromCart,
  increaseAmount,
  decreaseAmount,
};
