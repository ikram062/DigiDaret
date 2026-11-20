// Tiny dev seed: the five members of the report's demo circle, "Family Daret".
// Run with:  npm run db:seed
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.ts";

const DEMO_PASSWORD = "Daret1234";

const members = [
  { fullName: "Yasmine Alaoui", email: "yasmine@digidaret.test", preferredLanguage: "DARIJA", kycStatus: "VERIFIED" },
  { fullName: "Omar Bennani", email: "omar@digidaret.test", preferredLanguage: "FRENCH", kycStatus: "VERIFIED" },
  { fullName: "Salma Idrissi", email: "salma@digidaret.test", preferredLanguage: "ARABIC", kycStatus: "VERIFIED" },
  { fullName: "Karim Tazi", email: "karim@digidaret.test", preferredLanguage: "ENGLISH", kycStatus: "PENDING" },
  { fullName: "Aya Berrada", email: "aya@digidaret.test", preferredLanguage: "DARIJA", kycStatus: "UNVERIFIED" },
] as const;

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  for (const m of members) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: { ...m, passwordHash },
    });
  }
  console.log(`Seeded ${members.length} demo members. Log in with any of them, password: ${DEMO_PASSWORD}`);
  members.forEach((m) => console.log(`  ${m.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
