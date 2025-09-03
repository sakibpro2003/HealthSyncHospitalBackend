import { Request, Response } from "express";
import Product from "./product.model";
import { userService } from "./product.service";

const createProduct = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await userService.createProduct(payload);
    res.json({
      message: "Product created successfully",
      data: result,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "something went wrong",
      error,
    });
  }
};

const getProduct = async (req: Request, res: Response) => {
  try {
    const result = await userService.getProduct();
    res.json({
      message: "Medicines retrieved successfully",
      status: true,
      data: result,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "somthing went wrong",
      error,
    });
  }
};
const getSingleProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const productId = req.params.productId;
    const result = await userService.getSingleProduct(productId);

    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Bike not found",
      });
    }

    res.json({
      message: "Bicycle retrieved successfully",
      status: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};

const updateProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const productToUpdate = req.params.productId;
    const resultToUpdate = await userService.getSingleProduct(productToUpdate);
    if (!resultToUpdate) {
      return res.status(404).json({
        status: false,
        message: "Bike not found",
      });
    }
    const productId = req.params.productId;
    const data = req.body;
    console.log(req.body,"req body")
    const result = await userService.updateProduct(productId, data);
    console.log(data,"data update")
    res.json({
      message: "Bicycle updated successfully",
      data: result,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Product update failed!",
      error,
    });
  }
};
const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const result = await userService.deleteProduct(productId);
    res.json({
      message: "Bicycle deleted successfully",
      status: true,
      data: {},
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Delete Failed",
      error,
    });
  }
};

export const productController = {
  createProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
