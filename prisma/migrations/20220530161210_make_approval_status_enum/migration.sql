/*
  Warnings:

  - You are about to drop the column `waitingForApproval` on the `Task` table. All the data in the column will be lost.
  - Added the required column `approvalStatus` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('Waiting', 'Accepted', 'Denied');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "waitingForApproval",
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL;
