"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { inventoryApi } from "@/lib/inventory-client";
import type { Product } from "@/types/inventory";
import {
  IconAlertTriangle,
  IconEdit,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSearch,
} from "@/components/ui/Icons";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low_stock" | "in_stock">("all");
  const [sortBy, setSortBy] = useState<"name" | "stock_asc" | "stock_desc" | "price_desc">("name");

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const data = await inventoryApi.products();
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products
      .filter((p) => {
        // Search filter
        const query = search.trim().toLowerCase();
        if (query) {
          const nameMatch = p.name.toLowerCase().includes(query);
          const skuMatch = p.sku.toLowerCase().includes(query);
          const descMatch = p.description?.toLowerCase().includes(query) ?? false;
          if (!nameMatch && !skuMatch && !descMatch) return false;
        }

        // Tab filter
        const isLow =
          p.low_stock_threshold !== null && p.low_stock_threshold !== undefined
            ? p.quantity_on_hand <= p.low_stock_threshold
            : p.quantity_on_hand <= 5; // fallback convention

        if (filter === "low_stock") return isLow;
        if (filter === "in_stock") return !isLow && p.quantity_on_hand > 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "stock_asc") return a.quantity_on_hand - b.quantity_on_hand;
        if (sortBy === "stock_desc") return b.quantity_on_hand - a.quantity_on_hand;
        if (sortBy === "price_desc") {
          const priceA = parseFloat(a.selling_price || "0");
          const priceB = parseFloat(b.selling_price || "0");
          return priceB - priceA;
        }
        return 0;
      });
  }, [products, search, filter, sortBy]);

  const counts = useMemo(() => {
    if (!products) return { all: 0, low: 0, inStock: 0 };
    let low = 0;
    let inStock = 0;
    for (const p of products) {
      const isLow =
        p.low_stock_threshold !== null && p.low_stock_threshold !== undefined
          ? p.quantity_on_hand <= p.low_stock_threshold
          : p.quantity_on_hand <= 5;
      if (isLow) low++;
      else inStock++;
    }
    return { all: products.length, low, inStock };
  }, [products]);

  const formatCurrency = (val: string | null) => {
    if (!val) return "—";
    const num = parseFloat(val);
    if (isNaN(num)) return "—";
    return `$${num.toFixed(2)}`;
  };

  const getMargin = (cost: string | null, sell: string | null) => {
    if (!cost || !sell) return null;
    const c = parseFloat(cost);
    const s = parseFloat(sell);
    if (isNaN(c) || isNaN(s) || s <= 0) return null;
    const margin = ((s - c) / s) * 100;
    return margin;
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#20242e] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Products Catalog
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Search, filter, and manage warehouse inventory levels and unit pricing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadProducts}
            title="Refresh catalog"
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#232836] bg-[#12151c] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, product name, or keyword…"
            className="w-full rounded-lg border border-[#262b3a] bg-[#101218] pl-9 pr-14 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === "all"
                ? "bg-[#1f2533] text-white border border-[#30384d]"
                : "text-zinc-400 hover:bg-[#161a24] hover:text-zinc-200"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setFilter("low_stock")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === "low_stock"
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                : "text-zinc-400 hover:bg-[#161a24] hover:text-zinc-200"
            }`}
          >
            Low Stock ({counts.low})
          </button>
          <button
            onClick={() => setFilter("in_stock")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === "in_stock"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : "text-zinc-400 hover:bg-[#161a24] hover:text-zinc-200"
            }`}
          >
            Healthy ({counts.inStock})
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "stock_asc" | "stock_desc" | "price_desc")}
            className="rounded-lg border border-[#262b3a] bg-[#101218] px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-blue-500"
          >
            <option value="name">Name (A-Z)</option>
            <option value="stock_asc">Stock (Low to High)</option>
            <option value="stock_desc">Stock (High to Low)</option>
            <option value="price_desc">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && !products && (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-[#232836] bg-[#12151c] p-8 text-center">
          <IconRefresh className="h-6 w-6 animate-spin text-zinc-400" />
          <p className="mt-3 text-xs text-zinc-400">Loading catalog items…</p>
        </div>
      )}

      {/* Empty catalog state */}
      {!loading && products && products.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#292e3e] bg-[#12151c] p-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
            <IconPackage className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-white">No products in catalog yet</h3>
          <p className="mt-1 max-w-sm text-xs text-zinc-400 leading-relaxed">
            Get started by adding your first product SKU with its physical quantity and pricing structure.
          </p>
          <Link
            href="/products/new"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-xs transition"
          >
            <IconPlus className="h-3.5 w-3.5" />
            <span>Create First Product</span>
          </Link>
        </div>
      )}

      {/* No search results */}
      {!loading && products && products.length > 0 && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#232836] bg-[#12151c] p-10 text-center">
          <IconSearch className="h-6 w-6 text-zinc-500" />
          <h3 className="mt-2 text-xs font-semibold text-white">No matching products found</h3>
          <p className="mt-1 text-[11px] text-zinc-400">
            Try adjusting your search terms or resetting the active status filter.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="mt-3 rounded-lg border border-[#2c3243] bg-[#161a24] px-3 py-1.5 text-xs text-zinc-300 hover:bg-[#202533] hover:text-white"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Products Table */}
      {filteredProducts.length > 0 && (
        <div className="rounded-xl border border-[#232836] bg-[#12151c] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="border-b border-[#20242e] bg-[#141720] text-[11px] font-medium text-zinc-400">
                <tr>
                  <th className="px-5 py-3">Product & SKU</th>
                  <th className="px-5 py-3">Stock Status</th>
                  <th className="px-5 py-3">Unit Cost</th>
                  <th className="px-5 py-3">Selling Price</th>
                  <th className="px-5 py-3">Gross Margin</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2330]">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.quantity_on_hand === 0;
                  const threshold = p.low_stock_threshold ?? 5;
                  const isLow = p.quantity_on_hand <= threshold;
                  const margin = getMargin(p.cost_price, p.selling_price);

                  return (
                    <tr
                      key={p.id}
                      className="transition hover:bg-[#151923] group"
                    >
                      {/* Name & SKU */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#161922] border border-[#252a38] text-zinc-400">
                            <IconPackage className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/products/${p.id}`}
                              className="font-medium text-zinc-100 hover:text-blue-400 transition"
                            >
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="rounded border border-[#2b3040] bg-[#101218] px-1.5 py-0.2 font-mono text-[10px] text-zinc-400">
                                {p.sku}
                              </span>
                              {p.description && (
                                <span className="truncate max-w-[200px] text-[11px] text-zinc-400">
                                  {p.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              isOutOfStock
                                ? "border border-rose-500/20 bg-rose-500/10 text-rose-300"
                                : isLow
                                ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isOutOfStock
                                  ? "bg-rose-400"
                                  : isLow
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              }`}
                            />
                            <span>{p.quantity_on_hand} on hand</span>
                          </span>

                          {p.low_stock_threshold !== null && (
                            <span className="text-[10px] text-zinc-400">
                              (Min: {p.low_stock_threshold})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cost Price */}
                      <td className="px-5 py-3.5 font-mono text-zinc-400 tabular-nums">
                        {formatCurrency(p.cost_price)}
                      </td>

                      {/* Selling Price */}
                      <td className="px-5 py-3.5 font-mono font-medium text-zinc-200 tabular-nums">
                        {formatCurrency(p.selling_price)}
                      </td>

                      {/* Margin */}
                      <td className="px-5 py-3.5">
                        {margin !== null ? (
                          <span
                            className={`font-mono text-[11px] font-medium ${
                              margin >= 30
                                ? "text-emerald-400"
                                : margin > 0
                                ? "text-zinc-300"
                                : "text-rose-400"
                            }`}
                          >
                            {margin.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/products/${p.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-[#282d3c] bg-[#141720] px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-[#1d222e] hover:text-white transition"
                        >
                          <IconEdit className="h-3 w-3" />
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#20242e] bg-[#141720] px-5 py-2.5 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Showing {filteredProducts.length} of {products?.length ?? 0} items</span>
            <span className="text-zinc-400">Filtered by {filter}</span>
          </div>
        </div>
      )}
    </div>
  );
}
