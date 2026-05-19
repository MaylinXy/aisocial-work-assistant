CREATE TYPE "Role" AS ENUM ('ADMIN', 'WORKER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MID', 'HIGH');
CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'GENERATED', 'CLOSED');
CREATE TYPE "GenerationType" AS ENUM ('FULL_REPORT');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'WORKER',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseRecord" (
  "id" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "age" INTEGER,
  "gender" TEXT,
  "problemType" TEXT NOT NULL,
  "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
  "scene" TEXT NOT NULL,
  "currentIssue" TEXT NOT NULL,
  "serviceHistory" TEXT NOT NULL,
  "needs" TEXT NOT NULL,
  "availableResources" TEXT,
  "status" "CaseStatus" NOT NULL DEFAULT 'DRAFT',
  "workerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CaseRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiGeneration" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "generationType" "GenerationType" NOT NULL DEFAULT 'FULL_REPORT',
  "inputSnapshot" JSONB NOT NULL,
  "output" JSONB NOT NULL,
  "rawOutput" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'deepseek',
  "model" TEXT NOT NULL,
  "promptVersion" TEXT NOT NULL DEFAULT 'v1',
  "tokenUsage" JSONB,
  "latencyMs" INTEGER,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResourceEntry" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "targetGroup" TEXT,
  "region" TEXT,
  "description" TEXT NOT NULL,
  "materials" TEXT,
  "contact" TEXT,
  "keywords" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResourceEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "CaseRecord_workerId_createdAt_idx" ON "CaseRecord"("workerId", "createdAt");
CREATE INDEX "CaseRecord_problemType_idx" ON "CaseRecord"("problemType");
CREATE INDEX "CaseRecord_riskLevel_idx" ON "CaseRecord"("riskLevel");
CREATE INDEX "CaseRecord_status_idx" ON "CaseRecord"("status");
CREATE INDEX "AiGeneration_caseId_createdAt_idx" ON "AiGeneration"("caseId", "createdAt");
CREATE INDEX "ResourceEntry_category_idx" ON "ResourceEntry"("category");
CREATE INDEX "ResourceEntry_region_idx" ON "ResourceEntry"("region");
CREATE INDEX "ResourceEntry_enabled_idx" ON "ResourceEntry"("enabled");

ALTER TABLE "CaseRecord"
  ADD CONSTRAINT "CaseRecord_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiGeneration"
  ADD CONSTRAINT "AiGeneration_caseId_fkey"
  FOREIGN KEY ("caseId") REFERENCES "CaseRecord"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
