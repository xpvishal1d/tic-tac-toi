import { SiteHeader } from "@/components/site-header";
import { getAdminStats } from "@/lib/data";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  const user = await requireAdmin();
  const stats = await getAdminStats();

  return (
    <main className="min-h-screen bg-hero-glow">
      <SiteHeader user={user} />
      <div className="mx-auto max-w-6xl space-y-6 px-6 pb-14 pt-4">
        <section className="rounded-[2rem] border border-white/60 bg-white/78 p-8 shadow-panel backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cerulean">
            Admin overview
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-deep-space-blue md:text-5xl">
            Track players and finished matches.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-deep-space-blue/72">
            This dashboard reads directly from PostgreSQL through Drizzle inside Next.js server code.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.7rem] border border-white/60 bg-white/78 p-6 shadow-panel backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cerulean">Players</p>
            <p className="mt-4 font-heading text-5xl font-bold text-deep-space-blue">{stats.totalPlayers}</p>
          </article>
          <article className="rounded-[1.7rem] border border-white/60 bg-white/78 p-6 shadow-panel backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cerulean">Games</p>
            <p className="mt-4 font-heading text-5xl font-bold text-deep-space-blue">{stats.totalGames}</p>
          </article>
          {["win", "loss", "draw"].map((resultKey) => {
            const value = stats.results.find((item) => item.result === resultKey)?.count ?? 0;

            return (
              <article
                key={resultKey}
                className="rounded-[1.7rem] border border-white/60 bg-white/78 p-6 shadow-panel backdrop-blur"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cerulean">
                  {resultKey}
                </p>
                <p className="mt-4 font-heading text-5xl font-bold text-deep-space-blue">{value}</p>
              </article>
            );
          })}
        </section>

        <section className="rounded-[2rem] border border-white/60 bg-white/78 p-6 shadow-panel backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold text-deep-space-blue">Recent games</h2>
            <p className="text-sm text-deep-space-blue/60">Latest 8 matches</p>
          </div>
          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-deep-space-blue/10">
            <table className="min-w-full border-collapse">
              <thead className="bg-frosted-blue/35">
                <tr className="text-left text-sm font-semibold uppercase tracking-[0.18em] text-deep-space-blue">
                  <th className="px-4 py-4">Player</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Result</th>
                  <th className="px-4 py-4">Symbol</th>
                  <th className="px-4 py-4">Played</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {stats.recentGames.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-deep-space-blue/70">
                      No games saved yet.
                    </td>
                  </tr>
                ) : null}
                {stats.recentGames.map((game) => (
                  <tr key={game.id} className="border-t border-deep-space-blue/8 text-sm text-deep-space-blue">
                    <td className="px-4 py-4 font-semibold">{game.playerName}</td>
                    <td className="px-4 py-4 text-deep-space-blue/72">{game.playerEmail}</td>
                    <td className="px-4 py-4 capitalize">{game.result}</td>
                    <td className="px-4 py-4">{game.playerSymbol}</td>
                    <td className="px-4 py-4 text-deep-space-blue/72">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(game.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
