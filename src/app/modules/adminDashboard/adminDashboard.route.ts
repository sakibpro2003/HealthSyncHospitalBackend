import { Router } from "express";
import { adminDashboardController } from "./adminDashboard.controller";

const router = Router();

router.get("/insights", adminDashboardController.getAdminDashboardInsights);

export const AdminDashboardRoutes = router;
