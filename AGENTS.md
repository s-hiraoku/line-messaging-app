# Repository Guidelines

## Project Structure & Module Organization
- `src/app` — Next.js App Router (pages, `layout.tsx`, dashboard views) and API routes under `src/app/api/*` (e.g., `line/`, `users/`, `messages/`).
- `src/lib` — service clients and utilities (`line/`, `auth/`, `prisma/`, `redis/`).
- `src/state` — Jotai atoms grouped by domain (`message/`, `user/`, `template/`, `ui/`).
- `src/providers` — application-level providers.
- `prisma/schema.prisma` — data models and migrations.
- `public/` — static assets. `docs/system-design.md` — design notes.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npx prisma migrate dev && npx prisma generate` — set up DB/apply schema changes.
- `npm run dev` — start Next.js dev server at http://localhost:3000.
- `npm run build` — production build. `npm start` — run built app.
- `npm run lint` — ESLint (Next.js core-web-vitals + TypeScript rules).
- `npm test` / `npm run test:watch` — run Vitest (jsdom + Testing Library).

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`), path alias `@/*` from `tsconfig.json`.
- Indentation: 2 spaces. Keep imports sorted logically; remove unused code.
- Files: kebab-case for filenames (e.g., `nav-link.tsx`); React components PascalCase; Next.js route folders lower-case (e.g., `dashboard/messages`).
- Styling: Tailwind CSS (global styles in `src/app/globals.css`).
- Linting: fix violations or justify in-code disables narrowly.

## Testing Guidelines
- Frameworks: Vitest + @testing-library/react (+ jest-dom). See `vitest.config.ts` and `vitest.setup.ts`.
- Place tests near code: `*.test.ts`/`*.test.tsx` (e.g., `src/app/page.test.tsx`).
- Prefer behavior-focused tests; avoid testing implementation details. Use `data-testid` sparingly.

## Commit & Pull Request Guidelines
- Commit messages: follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`).
- PRs must include: clear description, linked issue, screenshots for UI changes, migration notes if `schema.prisma` changed.
- Before opening PR: `npm run lint`, `npm test`, and run `npx prisma generate` (and `migrate dev` when schema changes).

## Security & Configuration Tips
- Copy `.env.example` to `.env.local`; never commit secrets. Key vars: `LINE_CHANNEL_ID`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `NEXTAUTH_SECRET`, `DATABASE_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CLOUDINARY_*`, `SENTRY_DSN`.
- Rotate tokens promptly; avoid logging sensitive data. Include Prisma migrations in PRs.

## Agent-Specific Notes
- Keep patches focused and minimal; co-locate code with domain modules; update tests and docs together. Obey this file’s conventions for all touched paths.
