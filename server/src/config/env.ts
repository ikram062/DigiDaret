import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  isProd: process.env.NODE_ENV === "production",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  jwtSecret,
  /** Optional. Without it the assistant runs on its rules engine only. */
  geminiKey: process.env.GEMINI_API_KEY?.trim() || undefined,
  /** Tried in order: the second is a backup if the first is overloaded or retired. */
  geminiModels: (process.env.GEMINI_MODELS ?? "gemini-flash-lite-latest,gemini-3.1-flash-lite,gemini-3.5-flash-lite").split(",").map((m) => m.trim()).filter(Boolean),
};
