import express from "express";
import { cartController } from "./cart.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = express.Router();

router.post("/", auth(UserRole.USER), cartController.addToCart);
router.put(
  "/increase/:productId",
  auth(UserRole.USER),
  cartController.increaseAmount
);
router.put(
  "/decrease/:productId",
  auth(UserRole.USER),
  cartController.decreaseAmount
);
// router.post("/", auth(UserRole.ADMIN), productController.createProduct);
router.get("/", auth(UserRole.USER), cartController.getAllProductsFromCart);
// router.get("/:productId", productController.getSingleProduct);
router.delete(
  "/remove-item/:productId",
  auth(UserRole.USER),
  cartController.removeItemController
);
// router.delete("/", auth(UserRole.CUSTOMER), cartController.clearCart);
export const cartRoutes = router;
