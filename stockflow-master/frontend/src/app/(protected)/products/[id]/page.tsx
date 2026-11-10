"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm, type ProductPayload } from "@/components/inventory/ProductForm";
import { inventoryApi } from "@/lib/inventory-client";
import type { Product } from "@/types/inventory";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconLayers,
  IconPackage,
  IconRefresh,
  IconTrash,
} from "@/components/ui/Icons";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [quantityUpdating, setQuantityUpdating] = useState(false);
  const [quantitySuccess, setQuantitySuccess] = useState("");

  useEffect(() => {
    inventoryApi
      .product(id)
      .then((p) => {
        setProduct(p);
        setQuantity(p.quantity_on_hand);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function save(payload: ProductPayload) {
    const updated = await inventoryApi.updateProduct(id, payload);
    setProduct(updated);
    setQuantity(updated.quantity_on_hand);
  }

  async function remove() {
    if (!window.confirm(`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await inventoryApi.deleteProduct(id);
      router.replace("/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete product");
    }
  }

  async function updateQuantity(event: React.FormEvent) {
    event.preventDefault();
    setQuantityUpdating(true);
    setQuantitySuccess("");
    setError("");
    try {
      const updated = await inventoryApi.updateQuantity(id, quantity);
      setProduct(updated);
      setQuantitySuccess(`Stock updated to ${updated.quantity_on_hand} units.`);
      setTimeout(() => setQuantitySuccess(""), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update quantity");
    } finally {
      setQuantityUpdating(false);
    }
  }

  if (error && !product) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
          <IconArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products</span>
        </Link>
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <IconAlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
        <IconRefresh className="h-6 w-6 animate-spin text-zinc-400" />
        <p className="mt-3 text-xs text-zinc-400">Loading product details…</p>
      </div>
    );
  }

  const isOutOfStock = product.quantity_on_hand === 0;
  const threshold = product.low_stock_threshold ?? 5;
  const isLow = product.quantity_on_hand <= threshold;

  const cost = parseFloat(product.cost_price || "0");
  const sell = parseFloat(product.selling_price || "0");
  const margin = sell > 0 ? (((sell - cost) / sell) * 100).toFixed(1) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header and Actions */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          <IconArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products</span>
        </Link>

        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
              <IconPackage className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {product.name}
                </h1>
                <span className="rounded border border-[#2b3040] bg-[#101218] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  {product.sku}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {product.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                isOutOfStock
                  ? "border border-rose-500/20 bg-rose-500/10 text-rose-300"
                  : isLow
                  ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                  : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOutOfStock ? "bg-rose-400" : isLow ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              <span>{isOutOfStock ? "Out of Stock" : isLow ? "Low Stock Alert" : "In Stock"}</span>
            </span>

            <button
              onClick={remove}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
            >
              <IconTrash className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <IconAlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Snapshot Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#232836] bg-[#12151c] p-4">
          <span className="text-xs text-zinc-400">Current Stock</span>
          <p className="mt-1.5 text-xl font-bold text-white tabular-nums">{product.quantity_on_hand}</p>
          <span className="text-[10px] text-zinc-500">Threshold: {threshold} units</span>
        </div>

        <div className="rounded-xl border border-[#232836] bg-[#12151c] p-4">
          <span className="text-xs text-zinc-400">Unit Cost</span>
          <p className="mt-1.5 text-xl font-bold text-zinc-300 tabular-nums font-mono">
            {product.cost_price ? `$${parseFloat(product.cost_price).toFixed(2)}` : "—"}
          </p>
          <span className="text-[10px] text-zinc-500">Procurement cost</span>
        </div>

        <div className="rounded-xl border border-[#232836] bg-[#12151c] p-4">
          <span className="text-xs text-zinc-400">Selling Price</span>
          <p className="mt-1.5 text-xl font-bold text-white tabular-nums font-mono">
            {product.selling_price ? `$${parseFloat(product.selling_price).toFixed(2)}` : "—"}
          </p>
          <span className="text-[10px] text-zinc-500">Catalog retail</span>
        </div>

        <div className="rounded-xl border border-[#232836] bg-[#12151c] p-4">
          <span className="text-xs text-zinc-400">Gross Margin</span>
          <p className="mt-1.5 text-xl font-bold text-emerald-400 tabular-nums font-mono">
            {margin ? `${margin}%` : "—"}
          </p>
          <span className="text-[10px] text-zinc-500">Per unit sold</span>
        </div>
      </div>

      {/* Quick Quantity Adjuster Card */}
      <section className="rounded-xl border border-[#232836] bg-[#12151c] p-5">
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#20242e]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
            <IconLayers className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Quick Stock Count Adjustment</h2>
            <p className="text-[11px] text-zinc-400">
              Rapidly increment or decrement current count without modifying product metadata
            </p>
          </div>
        </div>

        <form onSubmit={updateQuantity} className="mt-4 flex flex-wrap items-center gap-2.5">
          {/* Steppers */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(0, q - 10))}
              className="rounded-lg border border-[#282d3c] bg-[#161a24] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#1f2533] hover:text-white transition"
            >
              -10
            </button>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(0, q - 1))}
              className="rounded-lg border border-[#282d3c] bg-[#161a24] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#1f2533] hover:text-white transition"
            >
              -1
            </button>
          </div>

          <div className="relative">
            <input
              aria-label="Quantity on hand"
              type="number"
              min={0}
              step={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)}
              className="w-28 rounded-lg border border-[#262b3a] bg-[#101218] px-3 py-1.5 text-center text-xs font-semibold text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="rounded-lg border border-[#282d3c] bg-[#161a24] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#1f2533] hover:text-white transition"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 10)}
              className="rounded-lg border border-[#282d3c] bg-[#161a24] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#1f2533] hover:text-white transition"
            >
              +10
            </button>
          </div>

          <button
            type="submit"
            disabled={quantityUpdating}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-medium text-white transition shadow-xs disabled:opacity-60"
          >
            {quantityUpdating ? <IconRefresh className="h-3.5 w-3.5 animate-spin" /> : null}
            <span>Update Stock</span>
          </button>

          {quantitySuccess && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <IconCheck className="h-3.5 w-3.5" />
              <span>{quantitySuccess}</span>
            </span>
          )}
        </form>
      </section>

      {/* Full Edit Form Section */}
      <section className="space-y-3 pt-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Full Product Specifications</h2>
          <p className="text-[11px] text-zinc-400">Modify SKU, description, pricing, and alert thresholds.</p>
        </div>

        <ProductForm
          key={`${product.id}-${product.name}-${product.sku}-${product.quantity_on_hand}`}
          initial={product}
          submitLabel="Save Changes to Product"
          onSubmit={save}
        />
      </section>
    </div>
  );
}
