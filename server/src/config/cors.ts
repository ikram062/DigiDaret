import type { CorsOptions } from "cors";
import { env } from "./env.ts";

export const corsOptions: CorsOptions = {
  origin: env.clientOrigin,
  credentials: true,
};
