import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, isAdmin } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-hero-glow text-deep-space-blue">
      <SiteHeader user={user} />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-14 pt-4">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <article className="rounded-[2rem] border border-white/60 bg-white/78 p-8 shadow-panel backdrop-blur md:p-12">
            <p className="inline-flex rounded-full bg-cerulean/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-cerulean">
              Next.js Full Stack
            </p>
            <h1 className="mt-6 max-w-3xl font-heading text-5xl font-bold leading-tight md:text-7xl">
              Tic Tac Toi with real users, saved matches, and live admin stats.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-deep-space-blue/76 md:text-xl">
              Register players, log in securely, save every completed tic-tac-toe result in PostgreSQL through Drizzle,
              and let admins monitor registrations and games from one polished dashboard.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={user ? "/play" : "/register"}
                className="rounded-2xl bg-deep-space-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-cerulean"
              >
                {user ? "Open game room" : "Create player account"}
              </Link>
              <Link
                href={isAdmin(user) ? "/admin" : "/login"}
                className="rounded-2xl border border-deep-space-blue/12 bg-white px-5 py-3 text-sm font-semibold text-deep-space-blue transition hover:border-cerulean hover:text-cerulean"
              >
                {isAdmin(user) ? "View admin dashboard" : "Login"}
              </Link>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/60 bg-deep-space-blue p-8 text-white shadow-panel md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-frosted-blue">
              Setup steps
            </p>
            <div className="mt-6 space-y-4">
              {[
                "docker compose up -d",
                "npm run db:push",
                "npm run db:seed",
                "npm run dev",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 font-heading text-lg font-bold">
                    {index + 1}
                  </div>
                  <code className="text-sm text-frosted-blue">{step}</code>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Secure auth",
              body: "Register and login flows run through Next route handlers with Zod validation, hashed passwords, and signed HTTP-only sessions.",
            },
            {
              title: "Saved results",
              body: "Every finished board can be written to PostgreSQL so players build a persistent history of wins, losses, and draws.",
            },
            {
              title: "Admin visibility",
              body: "Admins can see total registered players, total games played, result breakdowns, and the latest match activity.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur"
            >
              <h2 className="font-heading text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-base leading-7 text-deep-space-blue/75">{item.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
