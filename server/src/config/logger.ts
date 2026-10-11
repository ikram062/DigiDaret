import pino from "pino";
import morgan from "morgan";

export const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

export const httpLogger = morgan("dev");