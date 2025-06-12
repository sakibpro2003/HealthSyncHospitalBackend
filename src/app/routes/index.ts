import { type Request, type Response } from "express";
import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { PatientRoutes } from "../modules/patient/patient.routes";
import app from "../../app";
import globalErrorHandler from "../middleware/globalErrorHandler";
import { NewsletterRoutes } from "../modules/newsletter/newsletter.route";

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
];

router.get("/test", (req: Request, res: Response) => {
  res.send("Test route");
});
// app.use(globalErrorHandler)
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
