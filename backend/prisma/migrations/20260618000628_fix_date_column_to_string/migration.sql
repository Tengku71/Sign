/*
  Warnings:

  - You are about to drop the column `inputHeight` on the `AiModel` table. All the data in the column will be lost.
  - You are about to drop the column `inputWidth` on the `AiModel` table. All the data in the column will be lost.
  - You are about to drop the column `normalizeMean` on the `AiModel` table. All the data in the column will be lost.
  - You are about to drop the column `normalizeStd` on the `AiModel` table. All the data in the column will be lost.
  - You are about to drop the column `scoreThreshold` on the `AiModel` table. All the data in the column will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizMode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_modeId_fkey";

-- AlterTable
ALTER TABLE "AiModel" DROP COLUMN "inputHeight",
DROP COLUMN "inputWidth",
DROP COLUMN "normalizeMean",
DROP COLUMN "normalizeStd",
DROP COLUMN "scoreThreshold";

-- AlterTable
ALTER TABLE "DailyTrial" ALTER COLUMN "date" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "QuizMode";
