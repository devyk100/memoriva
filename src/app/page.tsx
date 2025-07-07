import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Zap, Users, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            Master Any Subject with{" "}
            <span className="text-primary">Smart Flashcards</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto">
            Boost your learning with spaced repetition, intelligent scheduling, and beautiful flashcards designed to help you remember more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/decks">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Learning
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8">
              <Link href="/study">
                <Brain className="w-5 h-5 mr-2" />
                Study Now
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Why Choose Memoriva?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform combines proven learning techniques with modern design to make studying effective and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
          <Card className="text-center border-border/50 hover:border-border transition-colors duration-200">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Smart Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Adaptive spaced repetition algorithm that learns from your performance and optimizes review timing.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-border/50 hover:border-border transition-colors duration-200">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Quick study sessions that fit into your busy schedule. Learn effectively in just 5-10 minutes a day.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-border/50 hover:border-border transition-colors duration-200">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Personal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Track your learning journey with detailed analytics and insights into your study patterns.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-border/50 hover:border-border transition-colors duration-200">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">AI Generated Study Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Personalized AI-powered study sessions tailored to your learning style, progress, and knowledge gaps.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Card className="bg-muted/50 border-border/50">
          <CardContent className="text-center py-12 sm:py-16">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of learners who have already improved their retention and study efficiency with Memoriva.
            </p>
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/decks">
                Get Started Today
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
