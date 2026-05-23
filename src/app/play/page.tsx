import { GameClient } from "@/components/game-client";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/session";

export default async function PlayPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-hero-glow">
      <SiteHeader user={user} />
      <div className="mx-auto max-w-6xl px-6 pb-14 pt-4">
        <GameClient playerName={user.name} />
      </div>
    </main>
  );
}
