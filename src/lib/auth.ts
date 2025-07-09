import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { AuthOptions, User, Account, Profile, Session } from "next-auth";
import { createUserIfNotExists } from "@/actions/create-user";
import { prisma } from "@/lib/prisma";

interface MySession extends Session {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // Add credentials provider for email/password login
    // CredentialsProvider({
    //   name: "Email",
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials, req) {
    //     // Add your authentication logic here
    //     return null
    //   }
    // })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect to /decks after successful sign in
      console.log('NextAuth redirect callback:', { url, baseUrl });
      
      // If redirecting from sign in or root, go to decks
      if (url === baseUrl || url === `${baseUrl}/` || url.includes('/api/auth/signin')) {
        console.log('Redirecting to /decks');
        return `${baseUrl}/decks`;
      }
      
      // If it's a relative URL, make it absolute and check if it should go to decks
      if (url.startsWith("/")) {
        if (url === "/" || url === "/login") {
          return `${baseUrl}/decks`;
        }
        return `${baseUrl}${url}`;
      }
      
      // If it's on the same origin, allow it
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch (e) {
        // Invalid URL, default to decks
        return `${baseUrl}/decks`;
      }
      
      // Default fallback to decks
      return `${baseUrl}/decks`;
    },
    async signIn({ user, account, profile }: { user: User, account: Account | null, profile?: Profile }) {
      if (account && user.email) {
        try {
          const authType = account.provider.toUpperCase() as "GOOGLE" | "GITHUB"
          const resp = await createUserIfNotExists({
            authType: authType,
            email: user.email,
            image: user.image || '',
            name: user.name || ''
          })
          console.log(resp.id, "has signed in")
          // Always return true to allow sign in
          return true
        } catch (error) {
          console.error("Error in signIn callback:", error)
          // Allow sign in even if user creation fails
          return true
        }
      }
      return true
    },
    async session({ session, token }) {
      // Add user ID to session if available
      if (session.user?.email) {
        try {
          const user = await prisma.user.findFirst({
            where: { email: session.user.email }
          })
          if (user) {
            (session.user as any).id = user.id
          }
        } catch (error) {
          console.error("Error fetching user in session callback:", error)
        }
      }
      return session
    }
  },
};
