// Dev seed: the five members of the report's demo circle, "Family Daret", plus two finished
// past circles so that each member already has a payment history (and therefore a score).
// ALL HISTORY HERE IS EXAMPLE DATA.
//
// Run with:  npm run db:seed      (safe to run again: it resets the demo members' circles)
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "../src/config/prisma.ts";
import { addMonthsClamped, todayUtc } from "../src/lib/dates.ts";
import { getUserScore } from "../src/services/scoreService.ts";

const DEMO_PASSWORD = "Daret1234";

const users = [
  { key: "yasmine", fullName: "Yasmine Alaoui", preferredLanguage: "DARIJA", kycStatus: "VERIFIED" },
  { key: "omar", fullName: "Omar Bennani", preferredLanguage: "FRENCH", kycStatus: "VERIFIED" },
  { key: "salma", fullName: "Salma Idrissi", preferredLanguage: "ARABIC", kycStatus: "VERIFIED" },
  { key: "karim", fullName: "Karim Tazi", preferredLanguage: "ENGLISH", kycStatus: "UNVERIFIED" }, // newcomer: no history, not verified yet
  { key: "aya", fullName: "Aya Berrada", preferredLanguage: "DARIJA", kycStatus: "VERIFIED" },
] as const;
type Key = (typeof users)[number]["key"];

type O = "T" | "G" | "R"; // T = on time, G = paid in the grace period, R = covered by the fund and repaid
const statusOf = { T: "PAID_ON_TIME", G: "PAID_IN_GRACE", R: "COVERED_REPAID" } as const;

// Four members, four rounds each, two circles back to back = 8 months of history.
// Karim has none: he is the newcomer.
const PAST = [
  {
    name: "Family Daret (spring)",
    monthsAgo: 8,
    order: ["yasmine", "salma", "omar", "aya"] as Key[],
    outcomes: { yasmine: "TTTT", salma: "TTGT", omar: "TTTT", aya: "GGGT" } as Record<string, string>,
  },
  {
    name: "Family Daret (summer)",
    monthsAgo: 4,
    order: ["salma", "aya", "omar", "yasmine"] as Key[],
    outcomes: { yasmine: "TTTT", salma: "TTTT", omar: "RTTT", aya: "GGTT" } as Record<string, string>,
  },
];

const email = (k: string) => `${k}@digidaret.test`;

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const byKey = new Map<string, string>();
  for (const u of users) {
    const row = await prisma.user.upsert({
      where: { email: email(u.key) },
      update: { fullName: u.fullName, preferredLanguage: u.preferredLanguage, kycStatus: u.kycStatus },
      create: { fullName: u.fullName, email: email(u.key), preferredLanguage: u.preferredLanguage, kycStatus: u.kycStatus, passwordHash },
    });
    byKey.set(u.key, row.id);
  }

  // reset: remove every circle the demo members organized (children first)
  const ids = [...byKey.values()];
  const old = (await prisma.circle.findMany({ where: { organizerId: { in: ids } }, select: { id: true } })).map((c) => c.id);
  await prisma.contribution.deleteMany({ where: { round: { circleId: { in: old } } } });
  await prisma.round.deleteMany({ where: { circleId: { in: old } } });
  await prisma.circleMember.deleteMany({ where: { circleId: { in: old } } });
  await prisma.circle.deleteMany({ where: { id: { in: old } } });

  const today = todayUtc();
  for (const c of PAST) {
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - c.monthsAgo, 5));
    const circle = await prisma.circle.create({
      data: {
        name: c.name,
        monthlyAmount: 1000,
        memberCount: c.order.length,
        startDate: start,
        graceDays: 3,
        orderMode: "AUTOMATIC",
        status: "COMPLETED",
        inviteToken: crypto.randomBytes(24).toString("base64url"),
        inviteActive: false,
        organizerId: byKey.get("yasmine")!,
        startedAt: start,
        completedAt: addMonthsClamped(start, c.order.length),
      },
    });
    const members = new Map<Key, string>();
    for (const [i, key] of c.order.entries()) {
      const m = await prisma.circleMember.create({
        data: { circleId: circle.id, userId: byKey.get(key)!, acceptedRulesVersion: 1, acceptedAt: start, payoutPosition: i + 1, orderApproved: true },
      });
      members.set(key, m.id);
    }
    for (const [i, recipient] of c.order.entries()) {
      const dueDate = addMonthsClamped(start, i);
      const round = await prisma.round.create({
        data: { circleId: circle.id, index: i + 1, dueDate, recipientMemberId: members.get(recipient)!, status: "PAID_OUT" },
      });
      for (const key of c.order) {
        const o = c.outcomes[key]![i] as O;
        const day = (n: number) => new Date(dueDate.getTime() + n * 86_400_000);
        await prisma.contribution.create({
          data: {
            roundId: round.id,
            memberId: members.get(key)!,
            userId: byKey.get(key)!,
            amount: 1000,
            dueDate,
            status: statusOf[o],
            paidAt: o === "T" ? day(0) : o === "G" ? day(2) : null,
            coveredAt: o === "R" ? day(4) : null,
            repaidAt: o === "R" ? day(14) : null,
          },
        });
      }
    }
  }

  console.log(`Seeded ${users.length} demo members. Password for all: ${DEMO_PASSWORD}\n`);
  for (const u of users) {
    const { score } = await getUserScore(byKey.get(u.key)!);
    console.log(
      `  ${email(u.key).padEnd(26)} ${String(score.points).padStart(3)} pts  Level ${score.level} (${score.levelName})  ${score.monthsOfHistory} months  ${u.kycStatus}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
