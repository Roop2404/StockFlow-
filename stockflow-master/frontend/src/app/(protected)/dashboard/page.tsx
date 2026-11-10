"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { inventoryApi } from "@/lib/inventory-client";
import type { DashboardSummary } from "@/types/inventory";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconLayers,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconTrendingUp,
} from "@/components/ui/Icons";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const summary = await inventoryApi.dashboard();
      setData(summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const healthScore =
    data && data.total_products > 0
      ? Math.max(0, Math.round(((data.total_products - data.low_stock_count) / data.total_products) * 100))
      : 100;

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#20242e] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Inventory Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time catalog metrics, safety stock tracking, and reorder alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh metrics"
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-[#272c3a] bg-[#141720] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#1a1f2b] hover:text-white transition disabled:opacity-50"
          >
            <IconRefresh className={`h-3.5 w-3.5 ${loading ? "animate-spin text-zinc-400" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/products/new"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition active:scale-[0.98]"
          >
            <IconPlus className="h-3.5 w-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <IconAlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data && (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-[#232836] bg-[#12151c] p-8 text-center">
          <IconRefresh className="h-6 w-6 animate-spin text-zinc-400" />
          <p className="mt-3 text-xs text-zinc-400">Loading catalog metrics…</p>
        </div>
      )}

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Products */}
            <div className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Total Catalog SKUs</span>
                <IconPackage className="h-4 w-4 text-zinc-500" />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-white">{data.total_products}</p>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Registered items</span>
                <Link href="/products" className="font-medium text-blue-400 hover:text-blue-300">
                  View catalog →
                </Link>
              </div>
            </div>

            {/* Units on Hand */}
            <div className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Units On Hand</span>
                <IconLayers className="h-4 w-4 text-zinc-500" />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-white">
                {data.total_quantity.toLocaleString()}
              </p>
              <div className="mt-2 text-[11px] text-zinc-500">Total physical inventory count</div>
            </div>

            {/* Low Stock Count */}
            <div
              className={`rounded-xl border p-5 ${
                data.low_stock_count > 0
                  ? "border-amber-500/20 bg-amber-500/[0.03]"
                  : "border-[#232836] bg-[#12151c]"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={data.low_stock_count > 0 ? "text-amber-300" : "text-zinc-400"}>
                  Reorder Alerts
                </span>
                <IconAlertTriangle
                  className={`h-4 w-4 ${data.low_stock_count > 0 ? "text-amber-400" : "text-zinc-500"}`}
                />
              </div>
              <p
                className={`mt-3 text-2xl font-bold tracking-tight ${
                  data.low_stock_count > 0 ? "text-amber-300" : "text-white"
                }`}
              >
                {data.low_stock_count}
              </p>
              <div className="mt-2 text-[11px]">
                {data.low_stock_count > 0 ? (
                  <span className="text-amber-400/90 font-medium">SKUs below safety buffer</span>
                ) : (
                  <span className="text-emerald-400">All threshold levels met</span>
                )}
              </div>
            </div>

            {/* Health Score */}
            <div className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Stock Availability</span>
                <IconTrendingUp className="h-4 w-4 text-zinc-500" />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-white">{healthScore}%</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Catalog fulfillment readiness</span>
              </div>
            </div>
          </div>

          {/* Low Stock Attention Section */}
          <section className="rounded-xl border border-[#232836] bg-[#12151c] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#20242e] bg-[#141720] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
                  <IconAlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Priority Reorder Watchlist</h2>
                  <p className="text-[11px] text-zinc-400">SKUs currently at or below minimum threshold</p>
                </div>
              </div>
              <Link
                href="/products"
                className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                <span>Full catalog</span>
                <IconArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {data.low_stock_products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <IconCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-xs font-semibold text-zinc-200">All Stock Levels Healthy</h3>
                <p className="mt-1 max-w-sm text-[11px] text-zinc-500">
                  Every product currently meets or exceeds its configured safety stock buffer.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e2330]">
                {data.low_stock_products.map((product) => {
                  const isOutOfStock = product.quantity_on_hand === 0;
                  const ratio = Math.min(
                    100,
                    Math.round((product.quantity_on_hand / Math.max(1, product.low_stock_threshold)) * 100)
                  );

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col justify-between gap-3 px-5 py-3.5 transition hover:bg-[#151923] sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="truncate text-xs font-medium text-white hover:text-blue-400 transition"
                          >
                            {product.name}
                          </Link>
                          <span className="rounded border border-[#2b3040] bg-[#101218] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                            {product.sku}
                          </span>
                        </div>
                        {/* Progress ratio */}
                        <div className="mt-2 flex max-w-xs items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className={`h-full rounded-full ${
                                isOutOfStock ? "bg-rose-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.max(6, ratio)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            {product.quantity_on_hand} of {product.low_stock_threshold} min
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            isOutOfStock
                              ? "border border-rose-500/20 bg-rose-500/10 text-rose-300"
                              : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : "Low Stock"}
                        </span>
                        <Link
                          href={`/products/${product.id}`}
                          className="rounded-md border border-[#2c3243] bg-[#161a24] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-[#202533] hover:text-white transition"
                        >
                          Adjust Stock
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Shortcuts */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
              <h3 className="text-sm font-semibold text-white">Create New Catalog Items</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Add new SKUs, register initial stock counts, set custom low-stock thresholds, and track cost margins.
              </p>
              <Link
                href="/products/new"
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition shadow-xs"
              >
                <IconPlus className="h-3.5 w-3.5" />
                <span>Add Product</span>
              </Link>
            </div>

            <div className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
              <h3 className="text-sm font-semibold text-white">Organization Default Threshold</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Configure tenant-wide baseline safety buffer used when individual products do not specify their own threshold.
              </p>
              <Link
                href="/settings"
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-[#2c3243] bg-[#161a24] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-[#202533] hover:text-white transition"
              >
                <IconSettings className="h-3.5 w-3.5" />
                <span>Configure Defaults</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
