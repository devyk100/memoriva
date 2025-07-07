import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database population...");

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: "devyk100@gmail.com" },
    update: {},
    create: {
      email: "devyk100@gmail.com",
      name: "Dev Test User",
      authType: "google",
      image: "https://via.placeholder.com/150",
    },
  });

  console.log("✅ Created user:", user.email);

  // Create sample flashcard decks
  const geographyDeck = await prisma.flashcardDeck.create({
    data: {
      name: "Geography Basics",
      flashcards: {
        create: [
          {
            front: "What is the capital of France?",
            back: "Paris is the capital and most populous city of France. It has been a major center of finance, diplomacy, commerce, fashion, science, and the arts since the 17th century.",
          },
          {
            front: "Which is the largest ocean on Earth?",
            back: "The Pacific Ocean is the largest and deepest ocean on Earth, covering about 46% of the world's ocean surface and about one-third of the total surface area.",
          },
          {
            front: "What is the highest mountain in the world?",
            back: "Mount Everest, located in the Himalayas on the border between Nepal and Tibet, stands at 8,848.86 meters (29,031.7 feet) above sea level.",
          },
          {
            front: "Which river is the longest in the world?",
            back: "The Nile River in Africa is generally considered the longest river in the world, flowing approximately 6,650 kilometers (4,130 miles) from its source to the Mediterranean Sea.",
          },
          {
            front: "What is the smallest country in the world?",
            back: "Vatican City is the smallest country in the world by both area and population, covering just 0.17 square miles (0.44 square kilometers) and home to around 800 people.",
          },
        ],
      },
    },
    include: {
      flashcards: true,
    },
  });

  const scienceDeck = await prisma.flashcardDeck.create({
    data: {
      name: "Science Fundamentals",
      flashcards: {
        create: [
          {
            front: "What is the chemical symbol for gold?",
            back: "Au - derived from the Latin word 'aurum' meaning gold. Gold is a chemical element with atomic number 79.",
          },
          {
            front: "How many bones are in the adult human body?",
            back: "An adult human body typically has 206 bones. Babies are born with about 270 bones, but many fuse together as they grow.",
          },
          {
            front: "What is the speed of light in a vacuum?",
            back: "The speed of light in a vacuum is approximately 299,792,458 meters per second (about 186,282 miles per second), often denoted as 'c' in physics equations.",
          },
          {
            front: "What is the periodic table?",
            back: "The periodic table is a tabular arrangement of chemical elements, ordered by their atomic number, electron configuration, and recurring chemical properties.",
          },
          {
            front: "What is photosynthesis?",
            back: "Photosynthesis is the process by which plants and other organisms use sunlight, water and carbon dioxide to create oxygen and energy in the form of sugar.",
          },
        ],
      },
    },
    include: {
      flashcards: true,
    },
  });

  const mathDeck = await prisma.flashcardDeck.create({
    data: {
      name: "Mathematics Basics",
      flashcards: {
        create: [
          {
            front: "What is the value of π (pi)?",
            back: "π (pi) is approximately 3.14159. It represents the ratio of a circle's circumference to its diameter.",
          },
          {
            front: "What is the Pythagorean theorem?",
            back: "The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c²",
          },
          {
            front: "What is the quadratic formula?",
            back: "The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a, used to solve quadratic equations of the form ax² + bx + c = 0",
          },
        ],
      },
    },
    include: {
      flashcards: true,
    },
  });

  console.log("✅ Created flashcard decks:");
  console.log(`  - ${geographyDeck.name} (${geographyDeck.flashcards.length} cards)`);
  console.log(`  - ${scienceDeck.name} (${scienceDeck.flashcards.length} cards)`);
  console.log(`  - ${mathDeck.name} (${mathDeck.flashcards.length} cards)`);

  // Create user-deck mappings
  await prisma.userDeckMapping.createMany({
    data: [
      {
        userId: user.id,
        deckId: geographyDeck.id,
        type: "EDITOR",
      },
      {
        userId: user.id,
        deckId: scienceDeck.id,
        type: "EDITOR",
      },
      {
        userId: user.id,
        deckId: mathDeck.id,
        type: "EDITOR",
      },
    ],
  });

  // Create deck metadata for SRS settings
  await prisma.deckMetadata.createMany({
    data: [
      {
        userId: user.id,
        deckId: geographyDeck.id,
        newCardCount: 5,
        reviewCardCount: 20,
      },
      {
        userId: user.id,
        deckId: scienceDeck.id,
        newCardCount: 3,
        reviewCardCount: 15,
      },
      {
        userId: user.id,
        deckId: mathDeck.id,
        newCardCount: 2,
        reviewCardCount: 10,
      },
    ],
  });

  console.log("✅ Created user-deck mappings and metadata");

  // Create SRS metadata for ALL cards with proper defaults
  const allFlashcards = [
    ...geographyDeck.flashcards,
    ...scienceDeck.flashcards,
    ...mathDeck.flashcards,
  ];

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Create SRS metadata for ALL cards - most as new cards (repetitions = -1)
  const srsMetadataData = allFlashcards.map((card, index) => {
    if (index < 2) {
      // First 2 cards are new cards (repetitions = -1)
      return {
        userId: user.id,
        flashcardId: card.id,
        repetitions: -1,
        easeFactor: 1.3,
        interval: BigInt(1),
        lastReviewed: null,
        nextReview: null,
      };
    } else if (index < 4) {
      // Next 2 cards are due for review
      return {
        userId: user.id,
        flashcardId: card.id,
        repetitions: 2,
        easeFactor: 1.5,
        interval: BigInt(120), // 2 hours in minutes
        lastReviewed: yesterday,
        nextReview: now,
      };
    } else {
      // Remaining cards are also new cards (repetitions = -1)
      return {
        userId: user.id,
        flashcardId: card.id,
        repetitions: -1,
        easeFactor: 1.3,
        interval: BigInt(1),
        lastReviewed: null,
        nextReview: null,
      };
    }
  });

  await prisma.sRSCardMetadata.createMany({
    data: srsMetadataData,
  });

  console.log("✅ Created initial SRS metadata");

  const stats = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      userDeckMappings: {
        include: {
          deck: {
            include: {
              flashcards: true,
            },
          },
        },
      },
      srsCardMetadata: true,
      deckMetadata: true,
    },
  });

  console.log("\n📊 Database Population Summary:");
  console.log(`👤 User: ${stats?.email}`);
  console.log(`📚 Decks: ${stats?.userDeckMappings.length}`);
  console.log(`🃏 Total Cards: ${stats?.userDeckMappings.reduce((acc, mapping) => acc + mapping.deck.flashcards.length, 0)}`);
  console.log(`📈 SRS Metadata Records: ${stats?.srsCardMetadata.length}`);
  console.log(`⚙️  Deck Metadata Records: ${stats?.deckMetadata.length}`);

  console.log("\n🎉 Database population completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during population:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
