import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FlashcardDeck } from "@/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeckListProps {
  decks: FlashcardDeck[];
}

const DeckList: React.FC<DeckListProps> = ({ decks }) => {
  if (decks.length === 0) {
    return <p className="text-center text-gray-500">No decks found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {decks.map((deck) => (
        <Card key={deck.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg truncate">{deck.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Click to study this deck</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const DecksPage = async () => {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name;

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }

  const decks = await prisma.flashcardDeck.findMany();

  return (
    <div className="container mx-auto py-10">
      {name && <h1 className="text-2xl font-semibold mb-6 text-center">{greeting}, {name}! 👋</h1>}
      <p className="text-gray-500 mb-4 text-center">Pick a deck to get started with:</p>
      <div className="flex justify-center">
        <DeckList decks={decks} />
      </div>
    </div>
  );
};

export default DecksPage;
