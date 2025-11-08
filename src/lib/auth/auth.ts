import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import LineProvider from "next-auth/providers/line";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const config: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    LineProvider({
      clientId: requiredEnv("LINE_CHANNEL_ID"),
      clientSecret: requiredEnv("LINE_CHANNEL_SECRET"),
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.displayName = (user as { displayName?: string | null }).displayName ?? user.name ?? "";
        token.lineUserId = (user as { lineUserId?: string | null }).lineUserId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {
          id: "",
          name: null,
          email: null,
          image: null,
          displayName: "",
          lineUserId: null,
        };
      }

      session.user.id = (token.userId as string | undefined) ?? token.sub ?? "";
      session.user.displayName =
        (token.displayName as string | undefined) ?? session.user.name ?? "";
      session.user.lineUserId =
        (token.lineUserId as string | null | undefined) ?? null;

      return session;
    },
  },
};

const authHandler = NextAuth(config);

export const GET = authHandler.handlers.GET;
export const POST = authHandler.handlers.POST;
export const { auth, signIn, signOut } = authHandler;
