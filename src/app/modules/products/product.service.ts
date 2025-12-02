import type { Request, Response } from "express";
import Product from "./product.model";
import type IProduct from "./product.interface";
// import IProduct from "./product.interface";

const updateInventory = async (id: string, quantityOrdered: number) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.quantity < quantityOrdered) {
    throw new Error("Insufficient stock available");
  }

  product.quantity -= quantityOrdered;

  if (product.quantity === 0) {
    product.inStock = false;
  }

  await product.save();
  return product;
};

const createProduct = async (payload: IProduct): Promise<IProduct> => {
  const result = await Product.create(payload);
  return result;
};
const getProduct = async () => {
  const result = await Product.find();
  return result;
};
const getSingleProduct = async (id: string) => {
  const result = await Product.findById(id);
  return result;
};
const updateProduct = async (id: string, data: IProduct) => {
  const result = await Product.findByIdAndUpdate(id, data, {
    new: true,
  });

  return result;
};
const deleteProduct = async (id: string) => {
  const result = await Product.findByIdAndDelete(id);
  return result;
};

export const userService = {
  createProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
};
