import { type Request, type Response } from "express";
import express from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { PatientRoutes } from "../modules/patient/patient.routes";

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
];

router.get("/test", (req: Request, res: Response) => {
  res.send("Test route");
});

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
