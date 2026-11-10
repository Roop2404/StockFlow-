"use client";

import { FormEvent, useEffect, useState } from "react";
import { inventoryApi } from "@/lib/inventory-client";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  IconAlertTriangle,
  IconBuilding,
  IconCheck,
  IconRefresh,
  IconSettings,
  IconShield,
} from "@/components/ui/Icons";

export default function SettingsPage() {
  const { user } = useAuth();
  const [threshold, setThreshold] = useState<number | undefined>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    inventoryApi
      .settings()
      .then((s) => setThreshold(s.default_low_stock_threshold))
      .catch((e: Error) => setError(e.message));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (threshold === undefined) return;
    setPending(true);
    setMessage("");
    setError("");
    try {
      const result = await inventoryApi.updateSettings(threshold);
      setThreshold(result.default_low_stock_threshold);
      setMessage("Organization inventory defaults saved successfully.");
      setTimeout(() => setMessage(""), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save settings");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Title */}
      <div className="border-b border-[#20242e] pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Organization Settings
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Configure organization-wide inventory alerting buffers, workspace profile, and tenant security.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <IconAlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Organization Snapshot */}
      {user && (
        <div className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#20242e]">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
              <IconBuilding className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-white uppercase tracking-wider">{user.organization.name}</h2>
              <p className="text-[11px] text-zinc-400">Tenant Workspace ID: {user.organization.id}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-lg border border-[#232836] bg-[#101218] p-3.5">
              <span className="text-[11px] text-zinc-400">Primary Administrator</span>
              <p className="mt-1 font-medium text-white">{user.name}</p>
              <p className="text-[11px] text-zinc-400">{user.email}</p>
            </div>
            <div className="rounded-lg border border-[#232836] bg-[#101218] p-3.5">
              <span className="text-[11px] text-zinc-400">Workspace Status</span>
              <p className="mt-1 flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Isolated & Active</span>
              </p>
              <p className="text-[11px] text-zinc-400">Tenant boundaries enforced</p>
            </div>
            <div className="rounded-lg border border-[#232836] bg-[#101218] p-3.5">
              <span className="text-[11px] text-zinc-400">Auth & BFF Protection</span>
              <p className="mt-1 font-medium text-zinc-200">Same-Origin BFF</p>
              <p className="text-[11px] text-zinc-400">Argon2id + HTTP-only cookies</p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Defaults Setting Form */}
      <section className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#20242e]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
            <IconSettings className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Default Low-Stock Threshold</h2>
            <p className="text-[11px] text-zinc-400">
              Applied automatically to all products unless customized on individual SKUs
            </p>
          </div>
        </div>

        {threshold === undefined && !error && (
          <div className="flex items-center gap-2.5 py-6 text-xs text-zinc-400">
            <IconRefresh className="h-4 w-4 animate-spin text-zinc-400" />
            <span>Loading threshold settings…</span>
          </div>
        )}

        {threshold !== undefined && (
          <form onSubmit={save} className="mt-4 space-y-4">
            <div className="max-w-md">
              <label className="block text-xs font-medium text-zinc-300">
                Default Safety Threshold (Units)
              </label>
              <div className="mt-1.5 flex items-center gap-2.5">
                <input
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-28 rounded-lg border border-[#262b3a] bg-[#101218] px-3 py-2 text-center text-xs font-semibold text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
                <span className="text-xs text-zinc-400">units minimum safety buffer</span>
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-500 leading-relaxed">
                When any product without its own specific threshold reaches this count or lower, it will automatically trigger dashboard alerts.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={pending}
                className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-xs transition active:scale-[0.98] disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <IconRefresh className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving changes…</span>
                  </>
                ) : (
                  <span>Save Inventory Defaults</span>
                )}
              </button>

              {message && (
                <div role="status" className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <IconCheck className="h-3.5 w-3.5" />
                  <span>{message}</span>
                </div>
              )}
            </div>
          </form>
        )}
      </section>

      {/* Security Details Card */}
      <section className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#20242e]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
            <IconShield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Tenant Security Safeguards</h2>
            <p className="text-[11px] text-zinc-400">Architectural guarantees safeguarding your inventory data</p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 text-xs text-zinc-300">
          <div className="flex items-start gap-2.5 rounded-lg border border-[#232836] bg-[#101218] p-3">
            <IconCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-200">Database Tenant Scoping</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Every product, threshold, and dashboard query executes strictly filtered against your authenticated organization ID.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-[#232836] bg-[#101218] p-3">
            <IconCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-200">BFF Shared Secret Token Shield</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Next.js server-side route handlers protect backend API endpoints with cryptographically verified shared secrets and CSRF tokens.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
