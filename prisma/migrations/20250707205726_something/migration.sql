/*
  Warnings:

  - The values [google,github] on the enum `AuthType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `userId` to the `FlashcardDeck` table without a default value. This is not possible if the table is not empty.

*/

-- AlterEnum - Create new enum and migrate data
BEGIN;
CREATE TYPE "AuthType_new" AS ENUM ('GOOGLE', 'GITHUB', 'EMAIL');
ALTER TABLE "User" ALTER COLUMN "authType" TYPE "AuthType_new" USING (
  CASE 
    WHEN "authType"::text = 'google' THEN 'GOOGLE'::"AuthType_new"
    WHEN "authType"::text = 'github' THEN 'GITHUB'::"AuthType_new"
    ELSE "authType"::text::"AuthType_new"
  END
);
ALTER TYPE "AuthType" RENAME TO "AuthType_old";
ALTER TYPE "AuthType_new" RENAME TO "AuthType";
DROP TYPE "AuthType_old";
COMMIT;

-- Create or get the demo user
INSERT INTO "User" (id, email, name, "authType") 
VALUES ('demo-user-id', 'devyk100@gmail.com', 'Devy K', 'GOOGLE')
ON CONFLICT (email) DO NOTHING;

-- Get the user ID for existing decks (use the demo user or first available user)
DO $$
DECLARE
    demo_user_id TEXT;
BEGIN
    -- Try to get the demo user first
    SELECT id INTO demo_user_id FROM "User" WHERE email = 'devyk100@gmail.com' LIMIT 1;
    
    -- If no demo user, get any user
    IF demo_user_id IS NULL THEN
        SELECT id INTO demo_user_id FROM "User" LIMIT 1;
    END IF;
    
    -- If still no user, create one
    IF demo_user_id IS NULL THEN
        demo_user_id := 'demo-user-id';
        INSERT INTO "User" (id, email, name, "authType") 
        VALUES (demo_user_id, 'devyk100@gmail.com', 'Devy K', 'GOOGLE');
    END IF;
    
    -- Add userId column with default value
    ALTER TABLE "FlashcardDeck" ADD COLUMN "userId" TEXT;
    
    -- Update existing decks to belong to the demo user
    UPDATE "FlashcardDeck" SET "userId" = demo_user_id WHERE "userId" IS NULL;
    
    -- Make userId required
    ALTER TABLE "FlashcardDeck" ALTER COLUMN "userId" SET NOT NULL;
END $$;

-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "order" INTEGER;

-- AlterTable
ALTER TABLE "FlashcardDeck" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER;

-- AddForeignKey
ALTER TABLE "FlashcardDeck" ADD CONSTRAINT "FlashcardDeck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
