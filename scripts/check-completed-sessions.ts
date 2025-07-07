import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking completed study sessions...');

  // Get all completed study sessions
  const completedSessions = await prisma.studySession.findMany({
    where: { status: 'READY' },
    include: {
      deck: true,
      cards: {
        include: { flashcard: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📊 Found ${completedSessions.length} completed study sessions`);

  for (const session of completedSessions) {
    console.log(`\n🎯 Session: ${session.id}`);
    console.log(`📚 Deck: ${session.deck.name}`);
    console.log(`💭 Prompt: ${session.prompt}`);
    console.log(`🎲 Max Cards: ${session.maxCards}`);
    console.log(`✅ Selected Cards: ${session.cards.length}`);
    console.log(`⏰ Created: ${session.createdAt.toISOString()}`);
    console.log(`🏁 Completed: ${session.completedAt?.toISOString()}`);
    
    if (session.cards.length > 0) {
      console.log('\n📋 Selected cards:');
      session.cards.forEach((card, index) => {
        console.log(`${index + 1}. ${card.flashcard.front}`);
      });
    }
    console.log('─'.repeat(80));
  }

  console.log('🎉 Check completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error checking sessions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
