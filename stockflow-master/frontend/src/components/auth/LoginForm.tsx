"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { csrfFetch } from "@/lib/auth-client";
import { useAuth } from "@/components/auth/AuthProvider";
import { IconAlertTriangle, IconArrowRight, IconRefresh } from "@/components/ui/Icons";

export function LoginForm() {
  const router = useRouter();
  const { restoreSession } = useAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await csrfFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(typeof body.detail === "string" ? body.detail : "Unable to sign in.");
        return;
      }
      await restoreSession();
      router.replace("/dashboard");
    } catch {
      setError("We could not reach StockFlow. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-300">
          Work Email
        </label>
        <div className="mt-1.5">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            maxLength={255}
            className="w-full rounded-lg border border-[#282d3c] bg-[#101218] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-zinc-300">
            Password
          </label>
        </div>
        <div className="mt-1.5">
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            maxLength={128}
            className="w-full rounded-lg border border-[#282d3c] bg-[#101218] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <IconAlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-xs transition active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? (
          <>
            <IconRefresh className="h-3.5 w-3.5 animate-spin" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <span>Sign In to Workspace</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <div className="pt-2 text-center text-xs text-zinc-400">
        New to StockFlow?{" "}
        <Link className="font-medium text-blue-400 hover:text-blue-300 transition" href="/register">
          Create an account
        </Link>
      </div>
    </form>
  );
}
