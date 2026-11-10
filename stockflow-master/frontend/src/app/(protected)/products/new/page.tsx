"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductForm, type ProductPayload } from "@/components/inventory/ProductForm";
import { inventoryApi } from "@/lib/inventory-client";
import { IconArrowLeft } from "@/components/ui/Icons";

export default function NewProductPage() {
  const router = useRouter();

  async function create(payload: ProductPayload) {
    const product = await inventoryApi.createProduct(payload);
    router.replace(`/products/${product.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Header & Breadcrumb */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          <IconArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products</span>
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
          Add New Product
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Create a new catalog item with SKU tracking, initial stock units, and pricing.
        </p>
      </div>

      {/* Form */}
      <ProductForm submitLabel="Create Product & Track SKU" onSubmit={create} />
    </div>
  );
}
