-- AlterTable
ALTER TABLE "Analyst" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Analyst_userId_key" ON "Analyst"("userId");

-- AddForeignKey
ALTER TABLE "Analyst" ADD CONSTRAINT "Analyst_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

