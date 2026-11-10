import Link from "next/link";
import { IconPackage } from "@/components/ui/Icons";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d11] px-4 py-12 text-zinc-100 sm:px-6">
      <section className="w-full max-w-md rounded-xl border border-[#232836] bg-[#12151c] p-7 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-white">
              <IconPackage className="h-4.5 w-4.5 text-zinc-200" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">StockFlow</span>
          </Link>
          <span className="text-[11px] text-zinc-400 font-mono">
            SECURE ACCESS
          </span>
        </div>

        <div className="mt-6 border-b border-[#20242e] pb-4">
          <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h1>
          <p className="mt-1 text-xs text-zinc-400">{description}</p>
        </div>

        <div className="mt-5">{children}</div>
      </section>
    </main>
  );
}
