-- Sync schema: add Analyst.level, move Requester/Department from clientId to organizationId

-- AlterTable: Add level to Analyst
ALTER TABLE "Analyst" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable: Department - drop clientId, add organizationId
ALTER TABLE "Department" DROP CONSTRAINT IF EXISTS "Department_clientId_fkey";
ALTER TABLE "Department" DROP COLUMN "clientId";
ALTER TABLE "Department" ADD COLUMN "organizationId" TEXT NOT NULL;
ALTER TABLE "Department" ADD CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- AlterTable: Requester - drop clientId, add organizationId
ALTER TABLE "Requester" DROP CONSTRAINT IF EXISTS "Requester_clientId_fkey";
ALTER TABLE "Requester" DROP COLUMN "clientId";
ALTER TABLE "Requester" ADD COLUMN "organizationId" TEXT NOT NULL;
ALTER TABLE "Requester" ADD CONSTRAINT "Requester_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
