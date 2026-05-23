# Tic Tac Toi

Single-project Next.js full-stack app with Tailwind, PostgreSQL, Drizzle, and cookie-based auth for a tic-tac-toe game.

## Quick start

### DigitalOcean PostgreSQL (recommended)

1. Create a managed PostgreSQL database on DigitalOcean.
2. Copy `.env.example` to `.env`.
3. Paste the **full** connection string from **Connection Details** into `DATABASE_URL` (include `?sslmode=require`).
4. If your password has special characters (`@`, `#`, `/`), [URL-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) it (`@` → `%40`).
5. In the database **Settings**, add your current IP under **Trusted sources** (required for local dev).
6. `npm install`
7. `npm run db:check` — should print `Database connected: ...ondigitalocean.com:...`
8. `npm run db:push`
9. `npm run db:seed`
10. `npm run dev`

### Local Docker (optional)

1. `docker compose up -d`
2. Set `DATABASE_URL=postgres://postgres:postgres@localhost:5432/tictactoi` in `.env`
3. `npm install` → `npm run db:push` → `npm run db:seed` → `npm run dev`

Default admin login:

- Email: `admin@tictactoi.local`
- Password: `Admin123!`
