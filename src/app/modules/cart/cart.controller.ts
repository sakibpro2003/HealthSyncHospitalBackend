import type { Request, Response } from "express";
import httpStatus from "http-status";
// import catchAsync from "../../app/utils/catchAsync";
// import { User } from "../User/user.model";
import { cartServices } from "./cart.service";
import mongoose, { type ObjectId } from "mongoose";
import Cart from "./cart.model";
import Product from "../products/product.model";
import catchAsync from "../../utils/catchAsync";
import { User } from "../user/user.model";
import AppError from "../../errors/appError";
// import AppError from "../../app/error/AppError";

const addToCart = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized: User ID not found in token.",
    });
  }
  const email = req.user.email;
  const getUser = await User.findOne({ email: email });
  const user = getUser?._id as unknown as ObjectId;
  const findCart = await Cart.findOne({ user });

  const payload = req.body;
  const { product } = payload;
  //TODO: add quantity to creaat cart item. then update cart increase
  const findProduct = await Cart.findOne({ product, user });
  if (findProduct?._id) {
    throw new AppError(httpStatus.CONFLICT, "Product already added");
  }

  const addItemToCart = await cartServices.addToCart({ payload, user });

  return res.status(httpStatus.CREATED).json({
    success: true,
    message: "Cart created successfully!",
    data: addItemToCart,
  });
});

const increaseAmount = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized: User ID not found in token.",
    });
  }

  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Invalid product ID format.",
    });
  }

  const email = req.user.email;
  const getUser = await User.findOne({ email });

  if (!getUser) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "User not found",
    });
  }

  const userId = getUser._id;

  const objectProductId = new mongoose.Types.ObjectId(productId);
  const product = await Product.findById(objectProductId);

  if (!product) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Product not found in the database",
    });
  }

  const updatedCart = await cartServices.increaseAmountIntoDb({
    userId,
    objectProductId,
  });

  if (!updatedCart) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Cart item not found",
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Quantity increased successfully!",
    data: updatedCart,
  });
});
const decreaseAmount = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized: User ID not found in token.",
    });
  }

  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Invalid product ID format.",
    });
  }

  const email = req.user.email;
  const getUser = await User.findOne({ email });

  if (!getUser) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "User not found",
    });
  }

  const userId = getUser._id;

  // Convert to ObjectId
  const objectProductId = new mongoose.Types.ObjectId(productId);
  const product = await Product.findById(objectProductId);

  if (!product) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Product not found in the database",
    });
  }

  const updatedCart = await cartServices.decreaseAmountIntoDb({
    userId,
    objectProductId,
  });

  if (!updatedCart) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Cart item not found",
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Quantity increased successfully!",
    data: updatedCart,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized: User email not found.",
    });
  }

  const user = await User.findOne({ email: userEmail });

  if (!user || !user._id) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "User not found!",
    });
  }

  const userId = user._id.toString();

  const response = await cartServices.clearCart(userId);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Cart cleared successfully!",
    data: response,
  });
});

const getAllProductsFromCart = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized: User ID not found in token.",
      });
    }
    const email = req.user.email;
    const getUser = await User.findOne({ email: email });
    const userId = getUser?._id as any;
    const cartProducts = await cartServices.getAllProductsFromCartService(userId);
    return res.status(httpStatus.OK).json({
      success: true,
      message: "Orders retrieved successfully!",
      data: cartProducts,
    });
  }
);

const removeItemController = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized: User ID not found in token.",
    });
  }
  const { productId } = req.params;
  const email = req.user.email;
  const getUser = await User.findOne({ email: email });
  const user = getUser?._id as any;

  const result = await cartServices.removeItemFromCartDb(productId, user);
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
