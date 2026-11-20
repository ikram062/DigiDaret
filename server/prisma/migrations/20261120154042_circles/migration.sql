-- CreateEnum
CREATE TYPE "CircleStatus" AS ENUM ('FORMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('JOINED', 'LEFT', 'REMOVED');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('UPCOMING', 'COLLECTING', 'PAID_OUT');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'PAID_ON_TIME', 'PAID_IN_GRACE', 'COVERED_UNPAID', 'COVERED_REPAID');

-- CreateTable
CREATE TABLE "circles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyAmount" INTEGER NOT NULL,
    "memberCount" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "graceDays" INTEGER NOT NULL DEFAULT 3,
    "orderMode" "OrderMode" NOT NULL DEFAULT 'AUTOMATIC',
    "status" "CircleStatus" NOT NULL DEFAULT 'FORMING',
    "rulesVersion" INTEGER NOT NULL DEFAULT 1,
    "inviteToken" TEXT NOT NULL,
    "inviteActive" BOOLEAN NOT NULL DEFAULT true,
    "orderSeed" TEXT,
    "organizerId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circle_members" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'JOINED',
    "acceptedRulesVersion" INTEGER,
    "acceptedAt" TIMESTAMP(3),
    "orderApproved" BOOLEAN NOT NULL DEFAULT false,
    "payoutPosition" INTEGER,
    "orderScore" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "circle_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "recipientMemberId" TEXT NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'UPCOMING',

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "coveredAt" TIMESTAMP(3),
    "repaidAt" TIMESTAMP(3),

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "circles_inviteToken_key" ON "circles"("inviteToken");

-- CreateIndex
CREATE INDEX "circles_organizerId_idx" ON "circles"("organizerId");

-- CreateIndex
CREATE INDEX "circle_members_userId_idx" ON "circle_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "circle_members_circleId_userId_key" ON "circle_members"("circleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "rounds_circleId_index_key" ON "rounds"("circleId", "index");

-- CreateIndex
CREATE INDEX "contributions_userId_dueDate_idx" ON "contributions"("userId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_roundId_memberId_key" ON "contributions"("roundId", "memberId");

-- AddForeignKey
ALTER TABLE "circles" ADD CONSTRAINT "circles_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_recipientMemberId_fkey" FOREIGN KEY ("recipientMemberId") REFERENCES "circle_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "circle_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
