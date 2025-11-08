import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

function optionalEnv(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() ? v : undefined;
}

const providers = [
  Credentials({
    name: "Admin",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const username = optionalEnv("ADMIN_USERNAME") ?? "admin";
      const password = optionalEnv("ADMIN_PASSWORD");
      if (!credentials) return null;
      const ok = credentials.username === username && ((password && credentials.password === password) || (!password && credentials.password === "admin"));
      if (!ok) return null;
      const user = await prisma.user.upsert({
        where: { lineUserId: "local-admin" },
        update: { displayName: "Admin" },
        create: { lineUserId: "local-admin", displayName: "Admin", isFollowing: true },
      });
      return { id: user.id, name: "Admin" } as any;
    },
  }),
];

// Optional LINE provider if env present (not required for channel ops)
const lineId = optionalEnv("LINE_CHANNEL_ID");
const lineSecret = optionalEnv("LINE_CHANNEL_SECRET");
if (lineId && lineSecret) {
  providers.push(LineProvider({ clientId: lineId, clientSecret: lineSecret }) as any);
}

const config: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: providers as any,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.displayName = (user as any).displayName ?? (user as any).name ?? "";
        token.lineUserId = (user as any).lineUserId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = { id: "", name: null, email: null, image: null, displayName: "", lineUserId: null } as any;
      }
      session.user.id = (token.userId as string | undefined) ?? (token.sub as string | undefined) ?? "";
      session.user.displayName = (token.displayName as string | undefined) ?? (session.user.name as string | null) ?? "";
      session.user.lineUserId = (token.lineUserId as string | null | undefined) ?? null;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
export const { GET, POST } = handlers;

