"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function DevLoginPage() {
  const [email, setEmail] = useState("devyk100@gmail.com");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dev-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        router.push("/decks");
        router.refresh();
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Development Login</CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Quick login for development and testing
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <Button 
            onClick={handleDevLogin} 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-center">
            <Button variant="link" onClick={() => router.push("/login")}>
              Use OAuth Login Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
