-- AlterTable
ALTER TABLE "FederatedRuntime" ADD COLUMN     "authorId" INTEGER;

-- AddForeignKey
ALTER TABLE "FederatedRuntime" ADD CONSTRAINT "FederatedRuntime_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
