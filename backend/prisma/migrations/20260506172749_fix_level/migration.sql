/*
  Warnings:

  - You are about to drop the column `Level` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Level",
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;
