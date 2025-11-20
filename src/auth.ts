import NextAuth from "next-auth";
import { PrismaClient } from "@prisma/client";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";

const prisma = new PrismaClient();

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Check if user exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        // Create new user
        await prisma.user.create({
          data: {
            email: user.email,
            displayName: user.name || "Unknown User",
            pictureUrl: user.image,
          },
        });
      }

      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;

        // Get user from database
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});
