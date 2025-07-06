import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { AuthOptions, User, Account, Profile } from "next-auth";
import { createUserIfNotExists } from "@/actions/create-user";

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
      if (account) {
        const authType = account.provider
        const resp = await createUserIfNotExists({
          authType: authType as "google" | "github",
          email: user.email!,
          image: user.image!,
          name: user.name!
        })
        const id = resp.id
        user.id = id
        return resp.isAuth
      } else {
        return true;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
