import { SiteHeader } from "@/components/site-header";
import { TimeTools } from "@/components/time-tools";
import { getCurrentUser } from "@/lib/session";

export default async function TimePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-hero-glow">
      <SiteHeader user={user} />
      <TimeTools />
    </main>
  );
}
