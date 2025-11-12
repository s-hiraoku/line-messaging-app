<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

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

## Frontend Development Guidelines

### API Integration and Debugging
**IMPORTANT**: When implementing UI screens/pages, ALWAYS include API debug information display.

**Requirements**:
1. **API Call Visibility**: Display all API requests made by the page
   - Request URL and method
   - Request parameters/body
   - Response status and data
   - Error details if failed

2. **Implementation Pattern**:
   - Add a debug panel (collapsible/toggleable) on the screen
   - Show API call logs in development mode
   - Include timing information for performance analysis
   - Display loading states and error messages clearly

3. **Example Pattern**:
   ```tsx
   // Debug panel component or inline debug section
   {process.env.NODE_ENV === 'development' && (
     <div className="border p-4 bg-gray-50 rounded">
       <h3>API Debug Info</h3>
       <pre>{JSON.stringify(apiDebugInfo, null, 2)}</pre>
     </div>
   )}
   ```

4. **Benefits**:
   - Easier troubleshooting during development
   - Better understanding of data flow
   - Quick identification of API issues
   - Improved developer experience

**Apply this pattern to**:
- Dashboard pages
- Form submission screens
- Data display screens
- Any page that makes API calls

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
- Keep patches focused and minimal; co-locate code with domain modules; update tests and docs together. Obey this file's conventions for all touched paths.