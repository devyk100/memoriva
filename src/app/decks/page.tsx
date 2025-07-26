import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Plus, Edit, Settings } from "lucide-react";
import Link from "next/link";
import { NewDeckDialog } from "@/components/new-deck-dialog";
import { getDeckStats } from "@/actions/update-card-srs";
import { getDeckSettings } from "@/actions/update-deck-settings";
import { DeckSettingsDialog } from "@/components/deck-settings-dialog";

interface DeckWithStats {
  id: string;
  name: string;
  stats: {
    totalCards: number;
    newCards: number;
    dueCards: number;
    futureCards: number;
    studiedToday: number;
  };
  settings: {
    newCardCount: number;
    reviewCardCount: number;
  };
}

interface DeckListProps {
  decks: DeckWithStats[];
}

const DeckList: React.FC<DeckListProps> = ({ decks }) => {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No decks available</h3>
        <p className="text-muted-foreground mb-6">Create your first flashcard deck to get started</p>
        <NewDeckDialog>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Deck
          </Button>
        </NewDeckDialog>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {decks.map((deck) => (
        <Card key={deck.id} className="group hover:shadow-lg transition-all duration-200 border border-border/50 hover:border-border h-full">
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
            {/* SRS Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">New: {deck.stats.newCards}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-muted-foreground">Due: {deck.stats.dueCards}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Total: {deck.stats.totalCards}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-muted-foreground">Today: {deck.stats.studiedToday}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {deck.stats.dueCards > 0 
                  ? `${deck.stats.dueCards} cards due` 
                  : deck.stats.newCards > 0 
                    ? `${deck.stats.newCards} new cards`
                    : "All caught up!"
                }
              </span>
            </div>

            <div className="flex gap-1">
              <Link href={`/card?id=${deck.id}`} className="flex-1">
                <Button
                  className="w-full border-border/50 hover:border-border hover:bg-muted/50 transition-all"
                  variant="outline"
                >
                  Study
                </Button>
              </Link>
              <Link href={`/card-editor?deck=${deck.id}`} className="flex-1">
                <Button
                  className="w-full border-border/50 hover:border-border hover:bg-muted/50 transition-all"
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </Link>
              <DeckSettingsDialog
                deckId={deck.id}
                deckName={deck.name}
                currentNewCardCount={deck.settings.newCardCount}
                currentReviewCardCount={deck.settings.reviewCardCount}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const DecksPage = async () => {
  try {
    const session = await getServerSession(authOptions);
    
    let userEmail: string;
    let userName: string;
    
    // Check if we have a valid session
    if (!session?.user?.email) {
      // No session - require authentication
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please log in to access your flashcard decks.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      );
    }
    
    userEmail = session.user.email;
    userName = session.user.name || 'User';

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return <div>User not found.</div>;
  }

  // Get user's decks with mappings
  const userDecks = await prisma.userDeckMapping.findMany({
    where: { userId: user.id },
    include: {
      deck: true,
    },
  });

  // Get stats and settings for each deck
  const decksWithStats: DeckWithStats[] = await Promise.all(
    userDecks.map(async (userDeck) => {
      const [statsResult, settings] = await Promise.all([
        getDeckStats(userDeck.deck.id),
        getDeckSettings(userDeck.deck.id),
      ]);
      
      return {
        id: userDeck.deck.id,
        name: userDeck.deck.name,
        stats: statsResult.stats || {
          totalCards: 0,
          newCards: 0,
          dueCards: 0,
          futureCards: 0,
          studiedToday: 0,
        },
        settings: settings || {
          newCardCount: 20,
          reviewCardCount: 100,
        },
      };
    })
  );

  // Calculate overall stats
  const totalDecks = decksWithStats.length;
  const totalDueCards = decksWithStats.reduce((sum, deck) => sum + deck.stats.dueCards, 0);
  const totalStudiedToday = decksWithStats.reduce((sum, deck) => sum + deck.stats.studiedToday, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          {userName && (
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2 sm:mb-3 text-foreground">
              {greeting}, {userName}! 👋
            </h1>
          )}
          <p className="text-base sm:text-lg text-muted-foreground">
            Choose a deck to begin your learning journey
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          <Card className="border border-border/50 hover:border-border transition-colors duration-200">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalDecks}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Available Decks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 hover:border-border transition-colors duration-200">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalDueCards}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Cards Due</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 hover:border-border transition-colors duration-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalStudiedToday}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Studied Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decks Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Your Flashcard Decks</h2>
            <NewDeckDialog />
          </div>

          <DeckList decks={decksWithStats} />
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error("Error loading decks page:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            We encountered an error while loading your decks. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
};

export default DecksPage;
