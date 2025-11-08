import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      displayName: string;
      lineUserId: string | null;
    };
  }

  interface User {
    displayName?: string | null;
    lineUserId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string;
    displayName?: string;
    lineUserId?: string | null;
  }
}
