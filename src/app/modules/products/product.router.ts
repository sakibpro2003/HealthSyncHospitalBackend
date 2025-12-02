import express, { type Request, type Response } from "express";
import { productController } from "./product.controller";
import upload, { uploadToCloudinary } from "../../middleware/multerConfig";
// import auth from "../../app/middlewares/auth";
// import { USER_ROLE } from "../User/user.constant";
// import upload from "../../app/middlewares/multerConfig";
// import Cart from "../cart/cart.model";

const router = express.Router();

// Upload a product image to Cloudinary and return the URL
router.post(
  "/upload",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "Image upload failed" });
        return;
      }

      const url = await uploadToCloudinary(req.file);

      res.status(200).json({
        message: "Image uploaded successfully",
        url,
      });
    } catch (error) {
      console.error("Upload middleware error:", error);
      const message =
        error instanceof Error ? error.message : "Image upload failed";
      res.status(400).json({ message });
    }
  }
);
router.post("/", productController.createProduct);
router.get("/", productController.getProduct);
router.get("/:productId", productController.getSingleProduct);
router.put("/:productId", productController.updateProduct);
router.delete(
  "/:productId",
  // auth(USER_ROLE.ADMIN),
  productController.deleteProduct
);
export const productRoutes = router;
