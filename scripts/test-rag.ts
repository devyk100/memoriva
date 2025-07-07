import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing RAG system...');

  // Get the demo user
  const user = await prisma.user.findUnique({
    where: { email: 'devyk100@gmail.com' },
  });

  if (!user) {
    console.error('❌ Demo user not found');
    return;
  }

  // Get the Computer Science Fundamentals deck
  const deck = await prisma.flashcardDeck.findFirst({
    where: { 
      name: 'Computer Science Fundamentals',
      userId: user.id 
    },
  });

  if (!deck) {
    console.error('❌ Computer Science Fundamentals deck not found');
    return;
  }

  console.log(`📚 Found deck: ${deck.name} (ID: ${deck.id})`);

  // Create a study session
  const studySession = await prisma.studySession.create({
    data: {
      userId: user.id,
      deckId: deck.id,
      prompt: 'Help me learn data structures and algorithms for coding interviews',
      maxCards: 10,
      status: 'PENDING',
    },
  });

  console.log(`✅ Created study session: ${studySession.id}`);

  // Test the RAG backend
  try {
    console.log('🔄 Calling RAG backend...');
    const response = await fetch('http://localhost:8080/api/study-sessions/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: studySession.id,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ RAG backend response:', result);
      
      // Wait a bit for processing
      console.log('⏳ Waiting for processing...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check the session status
      const updatedSession = await prisma.studySession.findUnique({
        where: { id: studySession.id },
        include: {
          cards: {
            include: { flashcard: true },
            orderBy: { order: 'asc' }
          }
        }
      });

      if (updatedSession) {
        console.log(`📊 Session status: ${updatedSession.status}`);
        console.log(`🎯 Selected cards: ${updatedSession.cards.length}`);
        
        if (updatedSession.cards.length > 0) {
          console.log('\n📋 Selected cards:');
          updatedSession.cards.forEach((card, index) => {
            console.log(`${index + 1}. ${card.flashcard.front}`);
          });
        }
      }
    } else {
      console.error('❌ RAG backend error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Error calling RAG backend:', error);
  }

  console.log('🎉 RAG test completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error testing RAG:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
