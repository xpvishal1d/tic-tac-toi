import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/play");
  }

  return (
    <main className="min-h-screen bg-hero-glow">
      <SiteHeader user={null} />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-14 pt-4 lg:grid-cols-[0.95fr_1fr] lg:items-center">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cerulean">
            New players
          </p>
          <h1 className="mt-4 font-heading text-5xl font-bold text-deep-space-blue md:text-6xl">
            Build your record from the first move.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-deep-space-blue/74">
            Register once and every win, loss, and draw can be saved directly to PostgreSQL through your Next.js app.
          </p>
        </section>
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
