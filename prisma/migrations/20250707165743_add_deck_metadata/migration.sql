-- CreateEnum
CREATE TYPE "SRSDifficulty" AS ENUM ('AGAIN', 'HARD', 'EASY');

-- CreateTable
CREATE TABLE "SRSCardMetadata" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.3,
    "interval" BIGINT NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT -1,
    "lastReviewed" TIMESTAMP(3),
    "nextReview" TIMESTAMP(3),

    CONSTRAINT "SRSCardMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckMetadata" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "newCardCount" INTEGER NOT NULL DEFAULT 20,
    "reviewCardCount" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "DeckMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SRSCardMetadata_userId_flashcardId_key" ON "SRSCardMetadata"("userId", "flashcardId");

-- CreateIndex
CREATE UNIQUE INDEX "DeckMetadata_userId_deckId_key" ON "DeckMetadata"("userId", "deckId");

-- AddForeignKey
ALTER TABLE "SRSCardMetadata" ADD CONSTRAINT "SRSCardMetadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRSCardMetadata" ADD CONSTRAINT "SRSCardMetadata_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckMetadata" ADD CONSTRAINT "DeckMetadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckMetadata" ADD CONSTRAINT "DeckMetadata_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "FlashcardDeck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
