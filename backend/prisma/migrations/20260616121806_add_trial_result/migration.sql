-- CreateTable
CREATE TABLE "TrialResult" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "materiId" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "wrong" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrialResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrialResult" ADD CONSTRAINT "TrialResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialResult" ADD CONSTRAINT "TrialResult_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
