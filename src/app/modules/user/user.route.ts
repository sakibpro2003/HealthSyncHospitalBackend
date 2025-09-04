import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post("/register", UserController.registerUser);
router.get("/get-all-users", UserController.getAllUsers);
router.put(`/block/:userId`, UserController.blockUser);

export const UserRoutes = router;
