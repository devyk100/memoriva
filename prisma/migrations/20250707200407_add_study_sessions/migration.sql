-- CreateEnum
CREATE TYPE "StudySessionStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "SRSCardMetadata" ADD COLUMN     "againReviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "easyReviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hardReviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "maxCards" INTEGER NOT NULL,
    "status" "StudySessionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySessionCard" (
    "id" TEXT NOT NULL,
    "studySessionId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "StudySessionCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudySessionCard_studySessionId_order_key" ON "StudySessionCard"("studySessionId", "order");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "FlashcardDeck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySessionCard" ADD CONSTRAINT "StudySessionCard_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySessionCard" ADD CONSTRAINT "StudySessionCard_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
