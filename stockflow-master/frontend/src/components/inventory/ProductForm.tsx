"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Product } from "@/types/inventory";
import {
  IconAlertTriangle,
  IconCheck,
  IconDollar,
  IconLayers,
  IconPackage,
  IconRefresh,
} from "@/components/ui/Icons";

export type ProductPayload = {
  name: string;
  sku: string;
  description: string | null;
  quantity_on_hand: number;
  cost_price: string | null;
  selling_price: string | null;
  low_stock_threshold: number | null;
};

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Product;
  submitLabel: string;
  onSubmit: (payload: ProductPayload) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [quantity, setQuantity] = useState(initial?.quantity_on_hand ?? 0);
  const [costPrice, setCostPrice] = useState(initial?.cost_price ?? "");
  const [sellingPrice, setSellingPrice] = useState(initial?.selling_price ?? "");
  const [threshold, setThreshold] = useState(
    initial?.low_stock_threshold !== null && initial?.low_stock_threshold !== undefined
      ? String(initial.low_stock_threshold)
      : ""
  );
  const [description, setDescription] = useState(initial?.description ?? "");

  // Generate suggested SKU from name
  function generateSuggestedSku() {
    if (!name.trim()) return;
    const clean = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w.slice(0, 3))
      .join("-");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setSku(`${clean || "SKU"}-${randomSuffix}`);
  }

  // Live profit margin calculation
  const marginPreview = useMemo(() => {
    const cost = parseFloat(costPrice);
    const sell = parseFloat(sellingPrice);
    if (!isNaN(cost) && !isNaN(sell) && sell > 0) {
      const profit = sell - cost;
      const margin = (profit / sell) * 100;
      return { profit, margin };
    }
    return null;
  }, [costPrice, sellingPrice]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const parseOptionalNumber = (val: string) => {
      const trimmed = val.trim();
      return trimmed === "" ? null : Number(trimmed);
    };

    try {
      await onSubmit({
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim() || null,
        quantity_on_hand: quantity,
        cost_price: costPrice.trim() || null,
        selling_price: sellingPrice.trim() || null,
        low_stock_threshold: parseOptionalNumber(threshold),
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save product");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Section 1: Identification */}
      <div className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#20242e]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
            <IconPackage className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Product Identification</h3>
            <p className="text-[11px] text-zinc-400">Unique catalog naming and stock keeping unit (SKU)</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-300">
              Product Name <span className="text-rose-400">*</span>
            </label>
            <div className="mt-1.5">
              <input
                type="text"
                required
                maxLength={200}
                placeholder="e.g. Ergonomic Office Desk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#262b3a] bg-[#101218] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* SKU */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300">
                SKU Identifier <span className="text-rose-400">*</span>
              </label>
              {!initial && name.trim() && (
                <button
                  type="button"
                  onClick={generateSuggestedSku}
                  className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition"
                >
                  Generate SKU
                </button>
              )}
            </div>
            <div className="mt-1.5">
              <input
                type="text"
                required
                maxLength={100}
                placeholder="e.g. DSK-ERG-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-lg border border-[#262b3a] bg-[#101218] px-3 py-2 font-mono text-xs uppercase text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-300">
              Description <span className="text-zinc-500">(Optional)</span>
            </label>
            <div className="mt-1.5">
              <textarea
                rows={3}
                placeholder="Add supplier notes, dimensions, or technical specifications…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-[#262b3a] bg-[#101218] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Stock Quantities & Buffer */}
      <div className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#20242e]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
            <IconLayers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Inventory & Thresholds</h3>
            <p className="text-[11px] text-zinc-400">Current warehouse on-hand count and low-stock reorder triggers</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Quantity on hand */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Physical Quantity on Hand <span className="text-rose-400">*</span>
            </label>
            <div className="mt-1.5">
              <input
                type="number"
                min={0}
                step={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)}
                className="w-full rounded-lg border border-[#262b3a] bg-[#101218] px-3 py-2 text-xs font-medium text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">Available physical stock in bins</p>
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Low-Stock Safety Buffer <span className="text-zinc-500">(Optional)</span>
            </label>
            <div className="mt-1.5">
              <input
                type="number"
                min={0}
                step={1}
                placeholder="Inherits org default if blank"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full rounded-lg border border-[#262b3a] bg-[#101218] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Triggers a dashboard alert when quantity drops to this count
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Financial Pricing */}
      <div className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#20242e]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
            <IconDollar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Unit Financials</h3>
            <p className="text-[11px] text-zinc-400">Unit procurement cost, selling price, and estimated margins</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Cost Price */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Procurement / Cost Price (USD)
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                $
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full rounded-lg border border-[#262b3a] bg-[#101218] pl-7 pr-3 py-2 font-mono text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 tabular-nums"
              />
            </div>
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Catalog Selling Price (USD)
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                $
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full rounded-lg border border-[#262b3a] bg-[#101218] pl-7 pr-3 py-2 font-mono text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 tabular-nums"
              />
            </div>
          </div>

          {/* Live Margin Calculation */}
          {marginPreview && (
            <div className="sm:col-span-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Gross Profit: <strong>${marginPreview.profit.toFixed(2)}</strong> / unit</span>
              </div>
              <span className="font-mono text-[11px] font-semibold">
                Margin: {marginPreview.margin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <IconAlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-xs transition active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? (
            <>
              <IconRefresh className="h-3.5 w-3.5 animate-spin" />
              <span>Saving product…</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
}
