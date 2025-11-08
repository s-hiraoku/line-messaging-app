/**
 * Session helpers for NextAuth.js.
 * Will be implemented after NextAuth setup.
 */
import type { Session } from "next-auth";

import { auth } from "@/lib/auth/auth";

export async function getCurrentSession(): Promise<Session | null> {
  return auth();
}
