"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevLoginPage() {
  const router = useRouter();

  const handleDevLogin = async () => {
    try {
      // Create a mock session by calling a development endpoint
      const response = await fetch('/api/dev-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'devyk100@gmail.com',
          name: 'Dev User',
        }),
      });

      if (response.ok) {
        // Redirect to decks page
        router.push('/decks');
      } else {
        alert('Failed to create dev session');
      }
    } catch (error) {
      console.error('Dev login error:', error);
      alert('Failed to create dev session');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Development Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This is a development-only login page for testing purposes.
          </p>
          <Button onClick={handleDevLogin} className="w-full">
            Login as devyk100@gmail.com
          </Button>
          <Button 
            onClick={() => router.push('/decks')} 
            variant="outline" 
            className="w-full"
          >
            Go to Decks (Direct)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
