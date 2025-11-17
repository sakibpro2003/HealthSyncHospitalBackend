import cors from "cors";
import express, { type Application, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import os from "os";
import { StatusCodes } from "http-status-codes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import config from "./app/config";

const app: Application = express();

const allowedOrigins = new Set(
  [
    ...(config.next_base_urls ?? []),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter((value): value is string => Boolean(value))
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

// seedAdmin();

app.get("/", (_req: Request, res: Response, _next: NextFunction) => {
  const currentDateTime = new Date().toISOString();
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Welcome to the Hospital Management System",
    version: "1.0.0",
    accessedAt: currentDateTime,
    server: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptimeSeconds: serverUptime,
    },
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
