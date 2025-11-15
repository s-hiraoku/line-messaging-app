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

## 11. High-Level Architecture

Layers:
- Presentation (Next.js App Router pages + React components)
- Application (Server Actions / API route handlers orchestrating workflows)
- Domain / State (Jotai atoms + React Query caches)
- Integration (LINE SDK, Prisma ORM, Redis, Socket.io, external services)
- Infrastructure (PostgreSQL, Upstash Redis, CDN/static, Sentry)

All external interactions flow through lib/ service clients to keep API routes thin and testable.

## 12. Request & Event Flow

Inbound LINE Webhook -> /api/line/webhook (signature verify) -> event dispatcher -> message persistence -> real-time emit to dashboard via Socket.io -> React Query invalidation.
Outbound Message -> UI action -> server action (auth/session check) -> LINE client send -> persist Message (direction OUTBOUND) -> broadcast delivery status updates through Socket.io.

## 13. Data Access Patterns

- Read-heavy dashboards use React Query (cache-first, background refetch every 30-60s).
- Atom layering: primitive atoms (ids, filters) -> derived atoms (selected users/messages) -> UI selectors.
- Avoid n+1 by batching user/message fetches; use Prisma `include` judiciously.

## 14. Performance Considerations

- Use incremental static regeneration for marketing pages; dashboard remains client-authenticated.
- Webhook + send endpoints kept lean (<100ms typical) by deferring heavy processing (e.g., analytics) to async jobs (future queue integration).
- Indexes: User(lineUserId), Message(userId, createdAt), Tag(name), Broadcast(status, scheduledAt).

## 15. Security Model

- NextAuth sessions: httpOnly secure cookies; short (8h) session with rolling refresh.
- Verify LINE X-Line-Signature header on webhook.
- Rate limit send/broadcast endpoints (Redis token bucket) to prevent abuse.
- Strict JSON schema validation (zod) on inbound POST bodies.

## 16. Error Handling Strategy

- Service clients throw typed errors (e.g., LineSendError, ValidationError) caught in route handlers returning structured JSON { error: { code, message } }.
- UI central Toast + optional error boundary surfaces failures with actionable messages.
- Sentry captures unhandled exceptions + performance traces (route, user id hashing).

## 17. Observability & Metrics

- Sentry for traces & errors.
- Custom lightweight logger with levels (debug/info/warn/error) writing to console in dev and structured JSON in prod.
- Future: integrate OpenTelemetry for distributed tracing (webhook -> job queue) once background workers added.

## 18. Internationalization (i18n) Roadmap

Initial MVP: Japanese UI text hard-coded; plan to introduce i18n library (next-intl) after feature stabilization.
Message templates store language metadata for multi-language broadcasts.

## 19. Scalability Roadmap

Phase 1: Single region deployment, stateless horizontally scalable Next.js + managed Postgres.
Phase 2: Introduce background workers for bulk broadcast queueing and analytics aggregation.
Phase 3: Shard message table (time-range partitioning) when volume > 50M rows.

## 20. Testing Strategy Expansion

- Unit: lib/ utilities, validation schemas.
- Integration: API route handlers (Vitest + supertest-like fetch mocks).
- E2E: Playwright simulating dashboard message send & webhook ingestion.
- Load (future): k6 scripts for broadcast endpoints & webhook concurrency.

## 21. Deployment & Environments

Envs: local, staging, production.
- Staging mirrors prod schema; anonymized snapshot for realistic data testing.
- Feature flags (simple env or Redis key) gate experimental editor features.

## 22. Future Enhancements

- Visual Template Editor (flex message builder) with real-time preview.
- Advanced audience segmentation (compound tag logic, activity filters).
- Analytics module: delivery funnels, user retention charts (materialized views).
- A/B Testing of template variants with automatic winner promotion.

## 23. Open Questions

1. Need decision on job queue provider (Upstash QStash vs. custom worker).
2. Do we support LINE rich menu management in v1?
3. Granular role-based access vs. single admin role?

## 24. Glossary

- Broadcast: One-to-many outbound message set, may be scheduled.
- Template: Reusable structured message (flex, carousel, etc.) with variable substitution.
- Tag: Label applied to users for segmentation.
- Atom: Minimal unit of state in Jotai.

## 25. Changelog Tracking

On major architecture changes, update this document and link PR in a Changelog section (to be appended).

## 26. API Surface Catalog

Base URL: `${NEXT_PUBLIC_BASE_URL}`
Auth: NextAuth session (cookie) + optional internal service token for background workers.

Public (Webhook):
- POST /api/line/webhook: Accepts LINE events. Headers: X-Line-Signature. Body: LINE event batch.

Authenticated (Dashboard / Server Actions):
- POST /api/line/send { toUserId, message }: Sends single message.
- POST /api/line/broadcast { audienceFilter, content, scheduleAt? }: Creates broadcast job.
- GET /api/messages?userId= &cursor=: Paginated messages (descending time) size=50.
- GET /api/users?tag= &search= &cursor=: Paginated users.
- POST /api/users/tags { userIds, tag }: Bulk tag add.
- DELETE /api/users/tags { userIds, tag }: Bulk tag remove.
- GET /api/templates: List active templates (filters: type, category).
- POST /api/templates { name, type, content, variables }: Create.
- PUT /api/templates/:id {...}: Update.
- DELETE /api/templates/:id: Soft delete (isActive=false).
- POST /api/rich-menu/preview { areas, imageUrl }: Generates preview (future).
- GET /api/analytics/summaries?range=7d|30d: Aggregate KPIs.

Server Internal (Workers):
- POST /api/internal/broadcast/dispatch { broadcastId }: Worker triggers chunked sends.
- POST /api/internal/reconcile { since }: Re-scan delivery statuses.

Response Envelope Convention:
```json
{ "ok": true, "data": ..., "meta": { "cursor": "..." } }
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }
```

## 27. Error Taxonomy

Codes:
- VALIDATION_ERROR: zod schema failure.
- AUTH_REQUIRED / FORBIDDEN: session missing / role not permitted.
- NOT_FOUND: entity absent.
- CONFLICT: duplicate resource (e.g., template name).
- RATE_LIMITED: token bucket exceeded.
- UPSTREAM_FAILURE: LINE API non-2xx.
- TIMEOUT: upstream or DB timeout.
- INTERNAL_ERROR: uncaught application exception.

Mapping:
- HTTP 400: VALIDATION_ERROR, CONFLICT.
- HTTP 401: AUTH_REQUIRED.
- HTTP 403: FORBIDDEN, RATE_LIMITED.
- HTTP 404: NOT_FOUND.
- HTTP 429: RATE_LIMITED (alternate form).
- HTTP 500: INTERNAL_ERROR, UPSTREAM_FAILURE, TIMEOUT.

## 28. Prisma Schema Rationale

- Use string cuid IDs for portability across regions (no sequence contention).
- Separate Tag & UserTag for flexible many-to-many growth.
- Broadcast audience stored as relation for small sets; large audiences pivot to materialized audience table or tag snapshot (future).
- Message.content as Json to accommodate multi-format payloads (flex template variations) without polymorphic tables.

## 29. Caching Strategy

Layers:
- Browser: React Query (staleTime: messages 5s, users 30s, templates 5m).
- Redis: Hot aggregates (recent inbound count, active followers) TTL 30s.
- CDN (future): Marketing pages only.
Cache Invalidation Triggers:
- Message send/webhook: invalidate user messages list + analytics summary keys.
- Tag mutation: invalidate filtered user lists.
- Template CRUD: invalidate templates list.

## 30. Rate Limiting

Mechanism: Redis token bucket.
Buckets:
- send_single: 30 / minute / channel.
- broadcast_create: 5 / minute.
- webhook_ingest: 1000 / minute (soft burst 2x).
Headers:
- X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After.

## 31. Role-Based Access Control (RBAC)

Roles (MVP): ADMIN (full), ANALYST (read-only analytics, users, messages), OPERATOR (send/broadcast, manage templates), SUPPORT (read messages/users, cannot send).
Storage: roles column in User admin table (separate from LINE followers).
Policy Evaluation: utility `can(user, action)` mapping to matrix.
Example Matrix (excerpt):
- ADMIN: all actions.
- OPERATOR: send_single, broadcast_create, template_crud.
- ANALYST: read_analytics, read_users, read_messages.
- SUPPORT: read_users, read_messages.

## 32. Security Controls

- Header Signature Verification (LINE webhook) using HMAC SHA256.
- CSRF: NextAuth built-in + safe HTTP verbs (mutations via POST, no stateful GET forms).
- HTTP Security Headers: Strict-Transport-Security, Content-Security-Policy (restrict script origins), X-Frame-Options DENY, X-Content-Type-Options nosniff.
- Secrets: Loaded from process.env; never logged.
- Sensitive Fields Redaction: user picture URLs logged only hashed for analytics.

## 33. Privacy & Data Retention

Policy Targets:
- Messages: retain 365 days rolling; anonymize content after 90 days for analytics (store structural metadata only) — future enhancement.
- User deletion: cascade remove tags, broadcasts participation except aggregated stats.
- Backups: daily snapshot (encrypted) retention 30 days.

## 34. Observability Schema

Structured Log Fields:
- timestamp, level, event, requestId, userIdHash, route, latencyMs, errorCode?, upstreamStatus?, retryCount?, payloadSize.
Sampling: info 100%, debug 10% (toggle env LOG_DEBUG=1 for full).
Dashboards (future): error rate by route, broadcast dispatch throughput, webhook latency percentiles.

## 35. Performance Budgets

Server Targets:
- P95 API latency: < 250ms (excluding broadcast bulk dispatch).
- Webhook processing: < 150ms P95.
Frontend Targets:
- LCP < 2.5s on dashboard (warm auth state).
- Initial JS bundle < 300KB gzip (code splitting + dynamic imports).

## 36. Capacity Planning (Initial)

Assumptions:
- Daily active users: 10k.
- Messages per user per month avg: 20 inbound + 15 outbound.
- Broadcasts per month: 60.
Derived:
- Monthly messages ≈ 350k -> table size growth manageable (< 1GB with indexing and JSON content compression).
Scaling Steps:
1. Add read replicas when CPU > 70% sustained.
2. Partition messages by month once > 50M rows.
3. Introduce queue for broadcast chunk sends > 10k recipients.

## 37. Failure Scenarios & Mitigations

Scenario: LINE API outage -> mark outbound messages status=PENDING_RETRY; retry exponential (1m, 5m, 30m, 2h) limit 5.
Scenario: Redis unavailable -> degrade real-time; fallback to in-process EventEmitter; log WARN.
Scenario: Database connection saturation -> enable pgbouncer, reduce pool size per worker.
Scenario: Webhook spike (bot attack) -> rate limit + signature failure reject early.
Scenario: Broadcast job partial failures -> accumulate failed user IDs; surface in UI with retry option.

## 38. Disaster Recovery

RPO: 24h (daily backup) initially; target 1h with WAL archiving in Phase 2.
RTO: < 4h manual restore; < 30m with automated orchestration later.
Runbook Outline:
1. Detect severity (error rate + downtime alerts).
2. Halt broadcast dispatch.
3. Restore latest backup to standby.
4. Point application DATABASE_URL to standby.
5. Reconcile missed webhooks via retention re-fetch (if supported) or user sync.

## 39. Environment Variables Catalog

Core:
- LINE_CHANNEL_ID, LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET.
- NEXTAUTH_SECRET, NEXTAUTH_URL.
- DATABASE_URL.
- UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN.
- SENTRY_DSN.
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (future image hosting).
Operational Flags:
- FEATURE_RICH_MENU_EDITOR=true|false.
- ENABLE_SOCKET_IO=true|false.
- LOG_DEBUG=0|1.

## 40. Frontend Component Architecture

Layers:
- Feature Modules (messages/, users/, templates/) exporting view components + hooks.
- Shared UI primitives (buttons, modals) - stateless.
- State hooks (useXyz) wrapping Jotai atoms + React Query, always in /src/state or /src/hooks.
Guidelines:
- Avoid deep prop drilling: derive data in context or hooks.
- Keep server-action triggers in dedicated action components.

## 41. Accessibility Guidelines

- All interactive elements reachable by Tab; focus ring preserved.
- Use ARIA live region for real-time new inbound message announcement.
- Color contrast ratio ≥ 4.5:1 for body text.
- Provide alt text for user avatars (fallback: "User avatar").

## 42. Internationalization Extension Plan

Phase 0: Hard-coded Japanese.
Phase 1: Extract strings to `src/i18n/messages.ts` using key-based lookups.
Phase 2: Integrate next-intl; load locale bundles; store per-user preferred locale.
Phase 3: Translate templates with variable placeholders `${name}`; enforce variable whitelist.

## 43. Template System Details

Content JSON Shape (flex-like):
```json
{ "type": "flex", "version": 1, "body": { "components": [...] }, "variables": ["username", "promoCode"] }
```
Validation: ensure variables referenced exist in `variables` list.
Rendering: server replaces variables using context map { variable: value } before send.
Versioning: maintain TemplateRevision table (future) for audit & rollback.

## 44. Background Job Queue (Future)

Options: Upstash QStash vs. custom worker (BullMQ with Redis).
Selection Criteria:
- Simplicity (QStash) vs. fine-grained control (BullMQ).
- Scheduling accuracy, retry policies, cost.
Initial Decision: start with minimal internal cron (node-cron) for scheduled broadcasts < 500 recipients; migrate when scale threshold reached.

## 45. Logging & Tracing Implementation

Wrapper `log(level, event, fields)` in `src/lib/log.ts`.
Trace Propagation: requestId per incoming request (crypto.randomUUID) attached to context.
Sentry Tracing: enable performance instrumentation for API routes + edge (future).
Log Rotation: rely on platform (e.g., Vercel/Render) or ship to external aggregator (Datadog - optional).

## 46. Message Delivery Status Lifecycle

States: QUEUED -> SENDING -> SENT | FAILED | RETRYING -> SENT | FAILED_FINAL.
Transition Rules:
- QUEUED -> SENDING when dispatch worker picks item.
- SENDING -> SENT on 2xx from LINE; -> FAILED on non-retriable error; -> RETRYING on transient error.
- RETRYING increments attempt count; if attempts > max, -> FAILED_FINAL.

## 47. Analytics Data Model (Future)

Materialized Views:
- daily_inbound_counts (date, count).
- broadcast_performance (broadcastId, sent, failed, delivered_pct).
Aggregation Job runs hourly; invalidates Redis summary keys.

## 48. Performance Optimization Techniques

- Avoid N+1: batch user fetch with Prisma `findMany where id in` for timeline rendering.
- Streaming responses (Next.js Route Handlers) for large list exports (future).
- Image optimization: next/image with remote patterns; Rich Menu preview cached.
- Websocket compression off initially (small payloads), enable per threshold.

## 49. Deployment Pipeline Outline

Steps:
1. Lint + Type Check.
2. Unit/Integration Tests.
3. Build (Next.js).
4. Prisma Migrate (if schema changes) gated by manual approval in staging.
5. Sentry Release creation + source map upload.
6. Deploy to staging; run smoke tests.
7. Promote to production.

## 50. Migration Strategy

Principles:
- Backwards-compatible schema additions (add columns nullable, then backfill, then NOT NULL).
- Avoid destructive changes without archive (dump & snapshot). Use `prisma migrate diff` for review.
- Track migration notes in PR description.

## 51. Cost Estimation (Rough)

Components Monthly (initial scale):
- Postgres (managed, 2 CPU, 8GB): $60.
- Redis (Upstash free tier initially): $0.
- Sentry (developer plan): $20.
- Cloudinary (starter): $0.
- Hosting (Vercel Pro / Render): $40-$60.
Total ≈ $120-$140.
Growth Factors: message volume (storage), broadcast concurrency (compute), analytics materialization (CPU).

## 52. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| LINE API quota exhaustion | Message failures | Medium | Monitor usage, backoff broadcasts |
| Redis hot key contention | Latency spikes | Low | Use per-shard keys, TTL staggering |
| Unbounded message JSON size | Storage cost | Medium | Validate payload size < 10KB |
| Missing webhook events | Data inconsistency | Medium | Periodic reconciliation task |
| Single admin compromise | Full access | Medium | Enforce MFA (future), audit logs |

## 53. Audit Logging (Future)

Events: TEMPLATE_CREATE/UPDATE/DELETE, BROADCAST_CREATE, USER_ROLE_CHANGE.
Store in append-only table with (id, actorId, eventType, entityId, diffJson, createdAt).
Retention: 365 days; exportable as CSV.

## 54. Frontend State Flow Example (Message Send)

User clicks send -> useSendMessageMutation (React Query) -> calls server action -> optimistic update adds OUTBOUND placeholder -> server response updates deliveryStatus -> websocket event reconciles status -> React Query invalidates messages list.

## 55. Sequence Diagrams (Textual)

Inbound Message:
```
LINE -> Webhook Route -> Signature Verify -> Persist Message(INBOUND) -> Emit Socket Event -> Dashboard Updates
```
Broadcast:
```
Admin UI -> Create Broadcast -> Persist BROADCAST(DRAFT/SCHEDULED) -> (Scheduler triggers) -> Worker Chunk Sends -> LINE API -> Update statuses -> Aggregation -> UI refresh
```

## 56. Data Consistency Policies

- Strong consistency for writes (single Postgres primary).
- Eventual consistency for real-time UI (socket may lag <2s).
- Idempotent webhook handling (deduplicate by eventId if provided; else hash body + timestamp window).

## 57. Environment Segregation Details

Local: in-memory Redis fallback, debug logging full.
Staging: mirrors production schema; anonymized user names; real LINE staging channel.
Production: full observability + sampling; stricter rate limits; feature flags toggle experimental modules.

## 58. Feature Flag Implementation

Approach: simple Redis key `feature:<flag>` returning 'on' | 'off'. Hook `useFeatureFlag('richMenuEditor')` caches 60s.
Critical flags stored also in environment variables for boot-time gating.

## 59. Template Variable Safety

Validation: variable names `[a-zA-Z_][a-zA-Z0-9_]{0,31}`; replacement escapes HTML special chars to avoid injection in flex messages.
Missing variable -> fallback to empty string + log WARN.

## 60. Future Integrations

- LINE Rich Menu management API.
- External analytics (Amplitude/Mixpanel) for admin usage patterns.
- Queue system (BullMQ) for high-volume broadcasts.
- AI-assisted template generation (guardrails for tone & length).

## 61. Operational Runbooks (Skeleton)

Broadcast Stuck:
1. Check broadcast status records where status=SENDING > threshold time.
2. Inspect worker logs for errors.
3. Retry failed chunk endpoint manually.
4. Escalate if >3 retries fail.

High Error Rate:
1. Examine Sentry error group top offenders.
2. Correlate with recent deploy; consider rollback.
3. Enable debug logs for affected routes.

## 62. Message Content Validation

Before send: ensure content JSON conforms to allowed schema per type (TEXT length <= 5000 chars, IMAGE requires url + size metadata, FLEX validated by structure). Reject early with VALIDATION_ERROR.

## 63. Real-time Delivery Channel

Transport: Socket.io over WebSocket; fallback to polling React Query if disabled.
Namespaces: `/events` for message/broadcast, `/presence` (future) for admin presence.
Payload Example:
```json
{ "type": "message.new", "data": { "id": "...", "userId": "...", "direction": "INBOUND" } }
```

## 64. Frontend Performance Enhancements (Planned)

- Virtualized message list (react-virtual) when > 500 messages in view.
- Skeleton loading for broadcast analytics.
- Prefetch user details on hover (React Query prefetchQuery).

## 65. Accessibility Testing Checklist

- Tab navigation order logical.
- ARIA roles for lists and live regions.
- Focus trapping in modals.
- Contrast verified by automated tooling (axe). 

## 66. Documentation Maintenance

Each major feature PR updates relevant section and adds entry to forthcoming Changelog table with: Date, PR, Summary, Impact.
Quarterly review: prune deprecated future roadmap items.

## 67. Static Asset Strategy

Store user-uploaded images in Cloudinary (future) with signed upload presets; Rich Menu images cached for 7d in CDN; fallback placeholders served from /public.

## 68. Time & Date Handling

All server timestamps stored UTC; client displays local timezone via Intl.DateTimeFormat.
Scheduling input accepted in local time -> converted to UTC before persistence.

## 69. Dependency Governance

Monthly scan: `npm audit --production` + Snyk (future). Outdated critical packages patched; minor updates batched.
Version pinning: caret for minor versions allowed, lockfile committed.

## 70. Future Partition Strategy (Messages)

Approach: PostgreSQL declarative partitioning by month (`messages_2025_11`). Global index on userId maintained via partitioned index. Archival process moves partitions older than retention threshold to cold storage.

## 71. Large Attachment Handling (Future)

For video/audio > current size limit: pre-upload to storage provider, store reference ID in message.content; asynchronous transcoding job updates metadata (duration, thumbnailUrl).

## 72. Compliance Considerations

Potential PII: displayName, pictureUrl; hashed for analytics. GDPR-like requests (delete/export) handled via admin console (future). Audit trail kept for template changes (non-PII).

## 73. Third-Party API Abstraction

`src/lib/line/` exports interface `LineClient` with methods: sendMessage, sendBroadcastChunk, getProfile. Enables mocking for tests; isolates retries & error mapping.

## 74. Testing Coverage Targets

Statements: 60% initial -> 75% after Phase 2.
Critical paths (webhook signature verify, send message action, broadcast scheduling) 90%+.
Generate coverage: `npm test -- --coverage` (Vitest). Threshold config in vitest config (future).

## 75. Broadcast Chunk Algorithm (Planned)

- Fetch audience user IDs.
- Split into chunks of 100.
- For each chunk: parallel send with concurrency limit 10; collect results; update statuses.
- Backoff if LINE rate limit header appears.

## 76. Upgrade Path (Major Dependencies)

Tailwind CSS 4: monitor release notes, run upgrade script on branch; visual regression smoke test.
Next.js: adopt minor releases monthly; major release path includes build size diff & route behavior audit.
Prisma: upgrade after verifying `prisma migrate diff` produces no destructive operations.

## 77. Monorepo Expansion (Future)

Potential packages:
- @app/web (Next.js)
- @app/workers (queues)
- @app/shared (types, schema)
Utilize Turborepo for task caching.

## 78. Configuration Validation

Startup validator checks presence & format of required env vars; fails fast with descriptive error list before server starts processing requests.

## 79. Data Access Layer Pattern

Wrap Prisma calls in repository functions (e.g., `messageRepository.findByUser(userId, cursor)`); avoid leaking ORM specifics to UI actions; improves testability.

## 80. Known Limitations (MVP)

- No rich menu CRUD yet.
- Broadcast analytics delayed (no real-time updates).
- No user segmentation beyond tags.
- Rate limiting simplistic token bucket without dynamic window adaptation.

## 81. Roadmap Snapshot (Quarterly)

Q1: RBAC refinement, queue integration, improved analytics.
Q2: Rich menu management, i18n rollout, audit logging.
Q3: Partitioning messages, advanced segmentation, AI templates.
Q4: Multi-region read replicas, active-active failover.

## 82. Changelog (To Start)

| Date | PR | Summary | Impact |
|------|----|---------|--------|
| (pending) | - | Initialize changelog section | Documentation |

## 83. Glossary Extensions

- Audience Filter: Criteria set selecting broadcast recipients (tags, activity).
- Partition: Database technique dividing large table into smaller physical segments.
- Idempotent: Property where repeated operation yields same result without side-effects.


