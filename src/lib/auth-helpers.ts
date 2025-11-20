import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get the authenticated user's ID from the session
 * @returns User ID if authenticated, null otherwise
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  return user?.id ?? null;
}

/**
 * Get the authenticated user's ID or throw an error
 * @throws Error if user is not authenticated
 */
export async function requireAuthenticatedUserId(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    throw new Error("認証が必要です");
  }
  return userId;
}
