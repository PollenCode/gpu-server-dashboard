/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `containerId` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Administrator', 'Moderator', 'User');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "mountedFolderPath" TEXT,
ADD COLUMN     "waitingForApproval" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "containerId" SET NOT NULL,
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT E'User';

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
