-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('NONE', 'OWN', 'TEAM', 'DEPARTMENT', 'COMPANY', 'ALL');

-- AlterTable
ALTER TABLE "Analyst" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "ClientContract" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "DemandType" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Requester" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "RolePermission" ADD COLUMN     "scope" "PermissionScope" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "createdById" TEXT;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_organizationId_name_key" ON "Team"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Analyst_organizationId_idx" ON "Analyst"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_organizationId_idx" ON "Client"("organizationId");

-- CreateIndex
CREATE INDEX "ClientContract_clientId_idx" ON "ClientContract"("clientId");

-- CreateIndex
CREATE INDEX "Demand_client_id_idx" ON "Demand"("client_id");

-- CreateIndex
CREATE INDEX "Demand_analyst_id_idx" ON "Demand"("analyst_id");

-- CreateIndex
CREATE INDEX "Demand_department_id_idx" ON "Demand"("department_id");

-- CreateIndex
CREATE INDEX "Demand_demand_type_id_idx" ON "Demand"("demand_type_id");

-- CreateIndex
CREATE INDEX "Demand_status_idx" ON "Demand"("status");

-- CreateIndex
CREATE INDEX "Demand_date_idx" ON "Demand"("date");

-- CreateIndex
CREATE INDEX "Demand_deletedAt_idx" ON "Demand"("deletedAt");

-- CreateIndex
CREATE INDEX "DemandType_organizationId_idx" ON "DemandType"("organizationId");

-- CreateIndex
CREATE INDEX "Department_organizationId_idx" ON "Department"("organizationId");

-- CreateIndex
CREATE INDEX "Requester_organizationId_idx" ON "Requester"("organizationId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analyst" ADD CONSTRAINT "Analyst_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analyst" ADD CONSTRAINT "Analyst_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analyst" ADD CONSTRAINT "Analyst_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientContract" ADD CONSTRAINT "ClientContract_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requester" ADD CONSTRAINT "Requester_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandType" ADD CONSTRAINT "DemandType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

