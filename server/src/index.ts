import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.ts";
import { logger, httpLogger } from "./config/logger.ts";
import { corsOptions } from "./config/cors.ts";
import { authRouter } from "./routes/auth.ts";

const app = express();
app.disable("x-powered-by");

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
app.use(httpLogger);

// Health
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "digidaret-api" });
});

// API
app.use("/api/auth", authRouter);

app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found." });
});

// Last-resort error handler: log the details, send the browser nothing sensitive.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

// Start
app.listen(env.port, () => {
  logger.info(`API listening on http://localhost:${env.port}`);
});
