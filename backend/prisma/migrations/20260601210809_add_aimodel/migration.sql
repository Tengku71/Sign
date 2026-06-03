-- CreateTable
CREATE TABLE "AiModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "modelPath" TEXT NOT NULL,
    "labelsPath" TEXT,
    "inputWidth" INTEGER,
    "inputHeight" INTEGER,
    "normalizeMean" DOUBLE PRECISION DEFAULT 127.5,
    "normalizeStd" DOUBLE PRECISION DEFAULT 127.5,
    "scoreThreshold" DOUBLE PRECISION DEFAULT 0.5,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiModel_version_key" ON "AiModel"("version");
