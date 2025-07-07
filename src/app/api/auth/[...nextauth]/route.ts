import NextAuth from "next-auth";
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

const authOptions: AuthOptions = {
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
          return resp.isAuth
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
