import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FlashcardDeck } from "@/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Plus } from "lucide-react";
import Link from "next/link";

interface DeckListProps {
  decks: FlashcardDeck[];
}

const DeckList: React.FC<DeckListProps> = ({ decks }) => {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No decks available</h3>
        <p className="text-muted-foreground mb-6">Create your first flashcard deck to get started</p>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Deck
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {decks.map((deck) => (
        <Link key={deck.id} href={`/card?id=${deck.id}`}>
          <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border border-border/50 hover:border-border h-full">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold leading-tight text-foreground group-hover:text-foreground transition-colors">
                  {deck.name}
                </CardTitle>
                <div className="p-1.5 bg-muted rounded-md">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Ready to study</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Personal</span>
                </div>
                <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">
                  New
                </div>
              </div>

              <Button 
                className="w-full mt-4 border-border/50 hover:border-border hover:bg-muted/50 transition-all"
                variant="outline"
              >
                Start Studying
              </Button>
            </CardContent>
          </Card>
        </Link>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 sm:px-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-16">
          {name && (
            <h1 className="text-3xl font-semibold mb-3 text-foreground">
              {greeting}, {name}! 👋
            </h1>
          )}
          <p className="text-lg text-muted-foreground">
            Choose a deck to begin your learning journey
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border border-border/50 hover:border-border transition-colors duration-200">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground">{decks.length}</div>
                  <p className="text-sm text-muted-foreground">Available Decks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border/50 hover:border-border transition-colors duration-200">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground">0</div>
                  <p className="text-sm text-muted-foreground">Study Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border/50 hover:border-border transition-colors duration-200">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground">Personal</div>
                  <p className="text-sm text-muted-foreground">Study Mode</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-foreground">Your Flashcard Decks</h2>
            <Button variant="outline" className="gap-2 border-border/50 hover:border-border">
              <Plus className="w-4 h-4" />
              New Deck
            </Button>
          </div>
          
          <DeckList decks={decks} />
        </div>
      </div>
    </div>
  );
};

export default DecksPage;
