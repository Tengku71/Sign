-- CreateTable
CREATE TABLE "QuizMode" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "options" JSONB NOT NULL,
    "modeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizMode_name_key" ON "QuizMode"("name");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "QuizMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
