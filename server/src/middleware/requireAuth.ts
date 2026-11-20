import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.ts";
import { SESSION_COOKIE, endSession, readSession } from "../lib/auth.ts";

/** Blocks the request unless a valid session cookie points at a real user. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = readSession(req.cookies?.[SESSION_COOKIE]);
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user) {
    endSession(res);
    return res.status(401).json({ message: "Please log in." });
  }
  res.locals.user = user;
  next();
}
