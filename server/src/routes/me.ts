import { Router } from "express";
import { prisma } from "../config/prisma.ts";
import { env } from "../config/env.ts";
import { isoDate, todayUtc } from "../lib/dates.ts";
import { forbidden } from "../lib/http.ts";
import { toPublicUser } from "../lib/auth.ts";
import { requireAuth } from "../middleware/requireAuth.ts";
import { getUserScore, hasOpenDebt } from "../services/scoreService.ts";

export const meRouter = Router();
meRouter.use(requireAuth);

/** Everything the Overview page needs in one call. */
meRouter.get("/summary", async (_req, res) => {
  const user = res.locals.user;
  const [{ score }, activeCircles, next, debt] = await Promise.all([
    getUserScore(user.id),
    prisma.circleMember.count({ where: { userId: user.id, status: "JOINED", circle: { status: { in: ["FORMING", "ACTIVE"] } } } }),
    prisma.contribution.findFirst({
      where: { userId: user.id, status: "PENDING", dueDate: { gte: todayUtc() }, round: { circle: { status: "ACTIVE" } } },
      orderBy: { dueDate: "asc" },
      include: { round: { include: { circle: { select: { id: true, name: true } } } } },
    }),
    hasOpenDebt(user.id),
  ]);
  res.json({
    activeCircles,
    hasOpenDebt: debt,
    nextPayment: next
      ? { amount: next.amount, dueDate: isoDate(next.dueDate), circleId: next.round.circle.id, circleName: next.round.circle.name }
      : null,
    score: { points: score.points, level: score.level, levelName: score.levelName, monthsOfHistory: score.monthsOfHistory },
  });
});

/** The member's own score with its full breakdown. Nobody else can ever read it. */
meRouter.get("/score", async (_req, res) => {
  const { score, history } = await getUserScore(res.locals.user.id);
  res.json({ score, history });
});

/**
 * Stand-in for the licensed partner's ID check, so the prototype can be used end to end.
 * Disabled in production: DigiDaret never verifies identity itself.
 */
meRouter.post("/verify-simulated", async (_req, res) => {
  if (env.isProd) throw forbidden("Identity is verified by our licensed partner.");
  const user = await prisma.user.update({ where: { id: res.locals.user.id }, data: { kycStatus: "VERIFIED" } });
  res.json({ user: toPublicUser(user) });
});
