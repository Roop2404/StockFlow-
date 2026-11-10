"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { csrfFetch } from "@/lib/auth-client";
import { useAuth } from "@/components/auth/AuthProvider";
import { IconAlertTriangle, IconArrowRight, IconRefresh } from "@/components/ui/Icons";

export function RegistrationForm() {
  const router = useRouter();
  const { restoreSession } = useAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm_password") ?? "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }
    try {
      const response = await csrfFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_name: form.get("organization_name"),
          name: form.get("name"),
          email: form.get("email"),
          password,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(typeof body.detail === "string" ? body.detail : "Please check the submitted information.");
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
    <form onSubmit={submit} className="space-y-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Organization Name"
          name="organization_name"
          placeholder="Acme Logistics"
          autoComplete="organization"
          className="sm:col-span-2"
        />
        <Field
          label="Your Full Name"
          name="name"
          placeholder="Jane Doe"
          autoComplete="name"
        />
        <Field
          label="Work Email"
          name="email"
          type="email"
          placeholder="jane@acme.com"
          autoComplete="email"
        />
        <Field
          label="Password (min 12 chars)"
          name="password"
          type="password"
          placeholder="••••••••••••"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
        />
        <Field
          label="Confirm Password"
          name="confirm_password"
          type="password"
          placeholder="••••••••••••"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
        />
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
            <span>Setting up workspace…</span>
          </>
        ) : (
          <>
            <span>Create Workspace Account</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <div className="pt-2 text-center text-xs text-zinc-400">
        Already have an account?{" "}
        <Link className="font-medium text-blue-400 hover:text-blue-300 transition" href="/login">
          Sign in
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  minLength,
  maxLength,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-zinc-300">
        {label}
      </label>
      <div className="mt-1">
        <input
          name={name}
          type={type}
          required
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength ?? (name === "email" ? 255 : 150)}
          className="w-full rounded-lg border border-[#282d3c] bg-[#101218] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
        />
      </div>
    </div>
  );
}
