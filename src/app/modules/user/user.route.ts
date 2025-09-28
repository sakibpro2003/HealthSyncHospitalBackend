import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post("/register", UserController.registerUser);
router.get("/get-all-users", UserController.getAllUsers);
router.get("/role-metrics", UserController.getRoleMetrics);
router.put(`/block/:userId`, UserController.blockUser);
router.put(`/unblock/:userId`, UserController.unblockUser);
router.put(`/update-role/:userId`, UserController.updateRole);

export const UserRoutes = router;
