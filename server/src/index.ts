import express, { type Request, type Response } from "express";
import cors from "cors";
import { logger, httpLogger } from "./config/logger.ts";
import { corsOptions } from "./config/cors.ts";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(httpLogger);

// Health
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "digidaret-api" });
});

// Start
app.listen(PORT, () => {
  logger.info(`BFF listening on http://localhost:${PORT}`);
});