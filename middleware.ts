export { auth as middleware } from "@/lib/auth/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/users/:path*",
    "/api/messages",
    "/api/templates/:path*",
    "/api/line/send",
    "/api/line/broadcast",
    "/api/events",
  ],
};

