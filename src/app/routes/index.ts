import { type Request, type Response } from "express";
import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { PatientRoutes } from "../modules/patient/patient.routes";
import { NewsletterRoutes } from "../modules/newsletter/newsletter.route";
import { DoctorRoutes } from "../modules/doctor/doctor.route";
import { DonorRoutes } from "../modules/donor/donor.route";
import { BlogRoutes } from "../modules/blog/blog.route";
import { BloodBankRoutes } from "../modules/bloodBank/bloodBank.route";
import { HealthPackageRouter } from "../modules/healthPackage/healthPackage.route";
import { SubscriptionRouter } from "../modules/subscription/subscription.route";
import { productRoutes } from "../modules/products/product.router";
import { PaymentRouter } from "../modules/payment/payment.route";
import { AdminDashboardRoutes } from "../modules/adminDashboard/adminDashboard.route";
import { AppointmentRouter } from "../modules/appointment/appointment.route";

const router = express.Router();
const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/patient",
    route: PatientRoutes,
  },
  {
    path: "/newsletter",
    route: NewsletterRoutes,
  },
  {
    path: "/doctor",
    route: DoctorRoutes,
  },
  {
    path: "/donor",
    route: DonorRoutes,
  },
  {
    path: "/blog",
    route: BlogRoutes,
  },
  {
    path: "/blood-bank",
    route: BloodBankRoutes,
  },
  {
    path: "/health-package",
    route: HealthPackageRouter,
  },
  {
    path: "/subscription",
    route: SubscriptionRouter,
  },
  {
    path: "/products",
    route: productRoutes,
  },
  {
    path: "/payment",
    route: PaymentRouter,
  },
  {
    path: "/admin-dashboard",
    route: AdminDashboardRoutes,
  },
  {
    path: "/appointments",
    route: AppointmentRouter,
  },
];

router.get("/test", (req: Request, res: Response) => {
  res.send("Test route");
});
// app.use(globalErrorHandler)
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
