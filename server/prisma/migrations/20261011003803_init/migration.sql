-- CreateEnum
CREATE TYPE "CredentialFormat" AS ENUM ('JSONLD', 'SD_JWT', 'MDOC');

-- CreateEnum
CREATE TYPE "FlowMode" AS ENUM ('CROSS_DEVICE', 'SAME_DEVICE');

-- CreateEnum
CREATE TYPE "TamperType" AS ENUM ('NONE', 'WRONG_TYPE', 'EXPIRED', 'BAD_SIGNATURE');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('VALID', 'INVALID', 'EXPIRED', 'ERROR', 'NOT_RUN');

-- CreateEnum
CREATE TYPE "RunOutcome" AS ENUM ('PENDING', 'PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('ISSUANCE', 'PRESENTATION', 'VERIFICATION');

-- CreateEnum
CREATE TYPE "EventDirection" AS ENUM ('REQUEST', 'RESPONSE');

-- CreateTable
CREATE TABLE "test_runs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "issuer" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "verifier" TEXT NOT NULL,
    "format" "CredentialFormat" NOT NULL,
    "proofType" TEXT,
    "flowMode" "FlowMode" NOT NULL DEFAULT 'CROSS_DEVICE',
    "tamper" "TamperType" NOT NULL DEFAULT 'NONE',
    "moduleVersions" JSONB,
    "verificationResult" "VerificationResult" NOT NULL DEFAULT 'NOT_RUN',
    "expectedResult" "VerificationResult" NOT NULL DEFAULT 'VALID',
    "outcome" "RunOutcome" NOT NULL DEFAULT 'PENDING',
    "failedStep" TEXT,
    "errorDetail" TEXT,
    "credentialSnapshot" JSONB,
    "notes" TEXT,
    "parentRunId" TEXT,

    CONSTRAINT "test_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_events" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "phase" "Phase" NOT NULL,
    "stepName" TEXT NOT NULL,
    "direction" "EventDirection" NOT NULL,
    "fromActor" TEXT,
    "toActor" TEXT,
    "httpMethod" TEXT,
    "url" TEXT,
    "statusCode" INTEGER,
    "headers" JSONB,
    "payload" JSONB NOT NULL,
    "latencyMs" INTEGER,
    "isError" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_runs_createdAt_idx" ON "test_runs"("createdAt");

-- CreateIndex
CREATE INDEX "test_runs_format_outcome_idx" ON "test_runs"("format", "outcome");

-- CreateIndex
CREATE INDEX "test_runs_issuer_wallet_verifier_idx" ON "test_runs"("issuer", "wallet", "verifier");

-- CreateIndex
CREATE INDEX "run_events_runId_phase_idx" ON "run_events"("runId", "phase");

-- CreateIndex
CREATE UNIQUE INDEX "run_events_runId_stepOrder_key" ON "run_events"("runId", "stepOrder");

-- AddForeignKey
ALTER TABLE "test_runs" ADD CONSTRAINT "test_runs_parentRunId_fkey" FOREIGN KEY ("parentRunId") REFERENCES "test_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_events" ADD CONSTRAINT "run_events_runId_fkey" FOREIGN KEY ("runId") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
