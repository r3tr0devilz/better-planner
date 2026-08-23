"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(signIn, null);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong w-full max-w-sm rounded-2xl p-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-mist">
          Better Planner
        </h1>
        <p className="mt-1 text-sm text-mist-dim">
          Sign in to your dashboard.
        </p>

        <form action={action} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-mist-dim">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-mist-dim">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-dawn px-4 py-2.5 font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
