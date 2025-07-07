import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Setting up demo deck access...');

  // Get the demo user
  const user = await prisma.user.findUnique({
    where: { email: 'devyk100@gmail.com' },
  });

  if (!user) {
    console.error('❌ Demo user not found');
    return;
  }

  // Get all decks owned by the user
  const decks = await prisma.flashcardDeck.findMany({
    where: { userId: user.id },
  });

  console.log(`📚 Found ${decks.length} decks for user ${user.email}`);

  // Create user deck mappings for all decks
  for (const deck of decks) {
    // Check if mapping already exists
    const existingMapping = await prisma.userDeckMapping.findFirst({
      where: {
        userId: user.id,
        deckId: deck.id,
      },
    });

    if (!existingMapping) {
      await prisma.userDeckMapping.create({
        data: {
          userId: user.id,
          deckId: deck.id,
          type: 'EDITOR', // Give full access
        },
      });
      console.log(`✅ Created access mapping for deck: ${deck.name}`);
    } else {
      console.log(`⚡ Access mapping already exists for deck: ${deck.name}`);
    }
  }

  console.log('🎉 Demo deck access setup completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error setting up demo access:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
