# My Library

A full-stack library monorepo based on the supplied `phase-0` reference: a reader-facing Next.js app, an administrator Next.js app, a NestJS API, PostgreSQL/Prisma, and shared UI/API packages.

## Applications

- `apps/user-web` — reader catalog, loans, profile, rules and live notification inbox (port 3000).
- `apps/admin-web` — library administration (port 3001 when started with a custom port).
- `apps/api` — NestJS API and Swagger at `/swagger` (port 4000).

## Local start

1. Copy `.env.example` to `.env.local` and replace `JWT_SECRET`.
2. Start PostgreSQL: `pnpm docker:local`.
3. Generate the client and apply migrations: `pnpm db:generate` then `pnpm db:migrate:local`.
4. Start all applications: `pnpm dev`.

For isolated development you can use `pnpm api`, `pnpm user`, or `pnpm admin`. Build everything with `pnpm build`.

The user stories are in [docs/USER_STORIES.md](docs/USER_STORIES.md). Read [docs/REALTIME_DEPLOYMENT.md](docs/REALTIME_DEPLOYMENT.md) before deploying multiple API replicas.
