/*
  Warnings:

  - A unique constraint covering the columns `[containerId]` on the table `FederatedRuntime` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FederatedRuntime_containerId_key" ON "FederatedRuntime"("containerId");
