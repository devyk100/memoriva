"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FaGoogle as Google, FaGithub as Github } from "react-icons/fa";

const LoginPage = () => {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-semibold mb-2">Welcome to Memoriva</h1>
      <p className="text-muted-foreground mb-4">
        Log in to access your flashcard decks and start studying.
      </p>
      <div className="flex flex-col space-y-4">
        <Button onClick={() => signIn("github", {callbackUrl: "/decks"})}>
          <Github className="mr-2 h-4 w-4" aria-label="Sign in with Github" />
          Sign in with GitHub
        </Button>
        <Button onClick={() => signIn("google", {callbackUrl: "/decks"})}>
          <Google className="mr-2 h-4 w-4" aria-label="Sign in with Google" />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
