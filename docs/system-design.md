# LINE Messaging App POC — Implementation Outline

This document maps the provided system design to concrete implementation tasks in this repository. It will guide the initial scaffolding and feature development.

## 1. Project Setup

- Next.js App Router project with TypeScript, Tailwind CSS 4, and Turbopack.
- Enforce project conventions through ESLint/TypeScript settings and shared path alias `@/*`.
- Add `.nvmrc`, `.editorconfig`, and workspace settings for consistent tooling (optional follow-up).

## 2. Dependency Baseline

Install the following packages as we begin implementing features:

```bash
npm install @line/bot-sdk @prisma/client next-auth @auth/prisma-adapter
npm install @upstash/redis socket.io socket.io-client
npm install @tanstack/react-query jotai jotai-devtools
npm install zod class-variance-authority clsx lucide-react
dev: npm install -D prisma @types/ws @types/node-fetch drizzle-kit
```

Notes:
- Revisit Tailwind CSS 4 alpha configuration once official release stabilises. Until then, keep an eye on compatibility with shadcn/ui.
- Socket.io server-side integration may require a custom `pages/api/socket` handler or Next.js `app` route adaptation.

## 3. Directory Structure

```text
src/
  app/
    (marketing)/              # Public landing pages (future)
    (dashboard)/
      layout.tsx
      page.tsx
      messages/
        page.tsx
      users/
        page.tsx
      broadcasts/
        page.tsx
      templates/
        page.tsx
      analytics/
        page.tsx
    api/
      line/
        send/route.ts
        broadcast/route.ts
        webhook/route.ts
      users/route.ts
      users/[id]/route.ts
      users/[id]/tags/route.ts
      messages/route.ts
      templates/route.ts
  lib/
    line/
    prisma/
    auth/
    redis/
  components/
    layout/
    ui/
  providers/
```

The goal is to align routes with the requested screen structure and API endpoints. Placeholders will throw `NotImplementedError` to keep the build sane while features are added iteratively.

## 4. Data Layer

- Configure Prisma with PostgreSQL (Supabase) by defining models: `User`, `Message`, `Template`, `Broadcast`, `Tag`, `UserTag` (join table).
- Run `npx prisma migrate dev` once connection URL is available.
- Provide seed script for local development.

### Prisma Model Draft

```prisma
model User {
  id           String   @id @default(cuid())
  lineUserId   String   @unique
  displayName  String
  pictureUrl   String?
  isFollowing  Boolean  @default(true)
  messages     Message[]
  tags         UserTag[]
  broadcasts   Broadcast[] @relation("BroadcastAudience")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

enum MessageType {
  TEXT
  IMAGE
  VIDEO
  AUDIO
  FLEX
  TEMPLATE
}

model Message {
  id            String           @id @default(cuid())
  type          MessageType
  content       Json
  direction     MessageDirection
  user          User             @relation(fields: [userId], references: [id])
  userId        String
  deliveryStatus String
  createdAt     DateTime @default(now())
}

model Template {
  id        String   @id @default(cuid())
  name      String
  type      MessageType
  content   Json
  variables Json
  category  String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Broadcast {
  id          String    @id @default(cuid())
  name        String
  content     Json
  scheduledAt DateTime?
  status      BroadcastStatus @default(DRAFT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  audience    User[]    @relation("BroadcastAudience", references: [id])
}

enum BroadcastStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
}

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  users     UserTag[]
}

model UserTag {
  user   User @relation(fields: [userId], references: [id])
  userId String
  tag    Tag  @relation(fields: [tagId], references: [id])
  tagId  String

  @@id([userId, tagId])
}
```

## 5. Auth & Session

- Configure NextAuth v5 with LINE login (OAuth) or email provider for admins.
- Use server actions guard to ensure session validation per request.
- Provide helper `getServerSession` wrapper in `src/lib/auth/session.ts`.

## 6. Messaging Workflow

- `src/lib/line/client.ts`: instantiate LINE SDK with channel credentials.
- Server actions (`src/actions/line.ts`) wrap messaging flows. Use TanStack Query mutations client-side.
- Webhook route verifies signatures and dispatches events to message handlers.

## 7. State Management (Jotai)

Create atoms under `src/state` matching the spec. Example placeholder file `src/state/message/atoms.ts` defines base atoms with mock data until API wiring is complete.

## 8. Real-time Layer

- Integrate Socket.io server via custom `src/lib/realtime/server.ts` and expose client hook.
- Use Redis pub/sub in production (Upstash). Provide abstraction to allow fallback to in-memory when env vars missing.

## 9. Monitoring & Observability

- Add Sentry SDK with Next.js integration.
- Configure basic logging utilities and request tracing.

## 10. Next Steps

1. Commit scaffolding (routes, providers, libs) matching this outline.
2. Configure Prisma schema and migrations; set up `.env.example` with required variables.
3. Implement LINE messaging service and webhook verification.
4. Build dashboard layouts and connect state atoms to server data via TanStack Query.
5. Add tests (Playwright + Vitest) for core flows.
