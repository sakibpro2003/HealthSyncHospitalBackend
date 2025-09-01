import express, {type  Request, type Response } from "express";
import { productController } from "./product.controller";
import upload from "../../middleware/multerConfig";
// import auth from "../../app/middlewares/auth";
// import { USER_ROLE } from "../User/user.constant";
// import upload from "../../app/middlewares/multerConfig";
// import Cart from "../cart/cart.model";

const router = express.Router();

// Upload Image and Update Product
router.post(
  "/upload/:_id",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { _id } = req.params;
      console.log(_id,"id")

      // Validate Cloudinary upload
      if (!req.file || !req.file.path) {
        res.status(400).json({ message: "Image upload failed" });
        return;
      }

      const imageUrl = req.file.path; // Get Cloudinary image URL
      console.log(imageUrl,"url")

      // Update product image in the database
      const updatedProduct = await Cart.findByIdAndUpdate(
        _id,
        { image: imageUrl },
        { new: true } // Return updated product
      );

      if (!updatedProduct) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      res.status(200).json({
        message: "Product image updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  }
);
router.post("/", productController.createProduct);
router.get("/", productController.getProduct);
router.get("/:productId", productController.getSingleProduct);
router.put("/:productId",auth(USER_ROLE.ADMIN), productController.updateProduct);
router.delete(
  "/:productId",
  auth(USER_ROLE.ADMIN),
  productController.deleteProduct
);
export const productRoutes = router;
