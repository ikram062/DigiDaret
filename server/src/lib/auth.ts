import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import type { User } from "../../generated/prisma/client";
import { env } from "../config/env.ts";

export const SESSION_COOKIE = "dd_session";
const SESSION_DAYS = 7;

const cookieOptions: CookieOptions = {
  httpOnly: true, // not readable from JavaScript, so XSS cannot steal the session
  sameSite: "lax",
  secure: env.isProd,
  path: "/",
};

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// A real bcrypt hash of a random string. Compared against when the email is unknown,
// so a login for a missing account takes as long as one for an existing account.
export const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export function startSession(res: Response, userId: string) {
  const token = jwt.sign({}, env.jwtSecret, {
    subject: userId,
    expiresIn: `${SESSION_DAYS}d`,
    algorithm: "HS256",
  });
  res.cookie(SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function endSession(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}

export function readSession(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    return typeof payload === "object" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

/** The only user fields the browser is ever sent. Never includes the password hash. */
export function toPublicUser(u: User) {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    preferredLanguage: u.preferredLanguage,
    kycStatus: u.kycStatus,
    createdAt: u.createdAt,
  };
}
