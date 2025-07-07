import { prisma } from '../src/lib/prisma';

async function cleanupDuplicateDecks() {
  console.log('🧹 Starting cleanup of duplicate demo decks...');

  try {
    // Find all decks with duplicate names
    const duplicateDecks = await prisma.flashcardDeck.groupBy({
      by: ['name'],
      having: {
        name: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        name: true
      }
    });

    console.log(`Found ${duplicateDecks.length} deck names with duplicates`);

    for (const duplicate of duplicateDecks) {
      console.log(`\n📚 Processing duplicates for: ${duplicate.name}`);
      
      // Get all decks with this name, ordered by ID (keep the first one)
      const decksWithSameName = await prisma.flashcardDeck.findMany({
        where: {
          name: duplicate.name
        },
        orderBy: {
          id: 'asc'
        },
        include: {
          flashcards: true,
          userDeckMappings: true,
          deckMetadata: true
        }
      });

      // Keep the first one (oldest), delete the rest
      const deckToKeep = decksWithSameName[0];
      const decksToDelete = decksWithSameName.slice(1);

      console.log(`  ✅ Keeping deck: ${deckToKeep.id} (${deckToKeep.flashcards.length} cards)`);

      for (const deckToDelete of decksToDelete) {
        console.log(`  🗑️  Deleting deck: ${deckToDelete.id} (${deckToDelete.flashcards.length} cards)`);
        
        // Delete in the correct order to respect foreign key constraints
        
        // 1. Delete SRS metadata for cards in this deck
        await prisma.sRSCardMetadata.deleteMany({
          where: {
            flashcard: {
              deckId: deckToDelete.id
            }
          }
        });

        // 2. Delete flashcards
        await prisma.flashcard.deleteMany({
          where: {
            deckId: deckToDelete.id
          }
        });

        // 3. Delete deck metadata
        await prisma.deckMetadata.deleteMany({
          where: {
            deckId: deckToDelete.id
          }
        });

        // 4. Delete user-deck mappings
        await prisma.userDeckMapping.deleteMany({
          where: {
            deckId: deckToDelete.id
          }
        });

        // 5. Finally delete the deck itself
        await prisma.flashcardDeck.delete({
          where: {
            id: deckToDelete.id
          }
        });
      }
    }

    // Get final count
    const finalCount = await prisma.flashcardDeck.count();
    const finalCards = await prisma.flashcard.count();
    
    console.log('\n✅ Cleanup completed!');
    console.log(`📊 Final counts:`);
    console.log(`   📚 Decks: ${finalCount}`);
    console.log(`   🃏 Cards: ${finalCards}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateDecks();
