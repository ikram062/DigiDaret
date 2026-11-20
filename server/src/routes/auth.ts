import { Router, type Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../config/prisma.ts";
import {
  DUMMY_HASH,
  endSession,
  hashPassword,
  startSession,
  toPublicUser,
  verifyPassword,
} from "../lib/auth.ts";
import { requireAuth } from "../middleware/requireAuth.ts";

export const authRouter = Router();

// Slows down password guessing. Counts per IP address.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(80),
  email,
  // Optional. Spaces and dashes are removed, so "+212 6 12-34-56-78" is accepted.
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.union([z.literal(""), z.string().regex(/^\+?\d{8,15}$/, "Enter a valid phone number.")]))
    .optional()
    .transform((v) => (v ? v : undefined)),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Use at most 72 characters.")
    .regex(/[A-Za-z]/, "Include at least one letter.")
    .regex(/\d/, "Include at least one number."),
  preferredLanguage: z.enum(["DARIJA", "ARABIC", "FRENCH", "ENGLISH"]).default("ENGLISH"),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

function badRequest(res: Response, error: z.ZodError) {
  const { fieldErrors } = z.flattenError(error);
  return res.status(400).json({ message: "Please fix the highlighted fields.", fieldErrors });
}

authRouter.post("/signup", authLimiter, async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error);
  const { fullName, email, phone, password, preferredLanguage } = parsed.data;

  const clash = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    select: { email: true },
  });
  if (clash) {
    const field = clash.email === email ? "email" : "phone";
    return res.status(409).json({
      message: `An account with this ${field} already exists.`,
      fieldErrors: { [field]: [`This ${field} is already in use.`] },
    });
  }

  const user = await prisma.user.create({
    data: { fullName, email, phone, preferredLanguage, passwordHash: await hashPassword(password) },
  });
  startSession(res, user.id);
  res.status(201).json({ user: toPublicUser(user) });
});

authRouter.post("/login", authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    // One message for both cases, so the form never reveals which emails have accounts.
    return res.status(401).json({ message: "Incorrect email or password." });
  }
  startSession(res, user.id);
  res.json({ user: toPublicUser(user) });
});

authRouter.post("/logout", (_req, res) => {
  endSession(res);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, (_req, res) => {
  res.json({ user: toPublicUser(res.locals.user) });
});
