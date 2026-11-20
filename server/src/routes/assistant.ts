import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { badRequest } from "../lib/http.ts";
import { requireAuth } from "../middleware/requireAuth.ts";
import { answer, startPayload } from "../services/assistant/index.ts";
import { buildContext } from "../services/assistant/context.ts";

export const assistantRouter = Router();
assistantRouter.use(requireAuth);

// Per member, so one person cannot burn the free AI quota for everyone
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  keyGenerator: (_req, res) => res.locals.user.id,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "You are asking too fast. Please wait a moment." },
});

const bodySchema = z.object({
  message: z.string().trim().min(1, "Type a question.").max(400, "Please keep your question under 400 characters."),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(1500) }))
    .max(12)
    .default([]),
});

assistantRouter.get("/start", async (_req, res) => {
  res.json(startPayload(await buildContext(res.locals.user)));
});

assistantRouter.post("/", limiter, async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid question.");
  const ctx = await buildContext(res.locals.user);
  res.json(await answer(parsed.data.message, parsed.data.history, ctx));
});
