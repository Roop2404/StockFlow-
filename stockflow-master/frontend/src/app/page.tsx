import Link from "next/link";
import { getApiHealth } from "@/lib/api";
import {
  IconArrowRight,
  IconCheck,
  IconDashboard,
  IconLayers,
  IconPackage,
  IconShield,
  IconTrendingUp,
} from "@/components/ui/Icons";

export default async function Home() {
  let status = "offline";
  try {
    status = (await getApiHealth()).status;
  } catch {
    // Backend starting up or unreachable
  }

  const isHealthy = status === "ok";

  return (
    <div className="relative min-h-screen bg-[#0b0d11] text-zinc-100">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#20242e] bg-[#0b0d11]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-white">
              <IconPackage className="h-4.5 w-4.5 text-zinc-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-zinc-100">StockFlow</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
            <a href="#features" className="hover:text-zinc-200 transition">Features</a>
            <a href="#preview" className="hover:text-zinc-200 transition">Platform</a>
            <a href="#architecture" className="hover:text-zinc-200 transition">Security</a>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-200 transition"
            >
              API Reference
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#232836] bg-[#12151c] px-2.5 py-1 text-[11px] text-zinc-400">
              <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>{isHealthy ? "API Operational" : "API Connecting"}</span>
            </div>
            <Link
              href="/login"
              className="rounded-lg border border-[#2b3040] bg-[#141720] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#1c212e] hover:text-white transition"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition active:scale-[0.98]"
            >
              <span>Get Started</span>
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#262c3c] bg-[#131620] px-3 py-1 text-xs text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Multi-Tenant Inventory & Stock Control</span>
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Real-time inventory management for modern operations.
          </h1>

          <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">
            Organize catalog SKUs, automate low-stock threshold alerts, and track unit margins with strict organization tenant isolation.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-medium text-white shadow-xs transition active:scale-[0.98]"
            >
              <span>Create Free Account</span>
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg border border-[#2c3243] bg-[#141720] px-5 py-2.5 text-xs font-medium text-zinc-200 hover:bg-[#1c212e] hover:text-white transition"
            >
              <span>Access Workspace</span>
            </Link>
          </div>

          {/* Value points */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Multi-Tenant Data Isolation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Safety Reorder Thresholds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>BFF Secure Session Tokens</span>
            </div>
          </div>
        </div>

        {/* Realistic Application Preview Card */}
        <section id="preview" className="mt-16">
          <div className="rounded-xl border border-[#232836] bg-[#11141c] shadow-2xl overflow-hidden">
            {/* Window title bar */}
            <div className="flex items-center justify-between border-b border-[#20242e] bg-[#141722] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 font-mono text-[11px] text-zinc-400">stockflow.internal/workspace/inventory</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Live Workspace</span>
              </div>
            </div>

            {/* Mockup Content */}
            <div className="p-6">
              {/* Stat row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-[#222734] bg-[#151923] p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Catalog SKUs</span>
                    <IconPackage className="h-4 w-4 text-zinc-500" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">1,482</p>
                  <p className="mt-1 text-[11px] text-emerald-400">+12 added this week</p>
                </div>

                <div className="rounded-lg border border-[#222734] bg-[#151923] p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Units on Hand</span>
                    <IconLayers className="h-4 w-4 text-zinc-500" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">48,290</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Across active warehouse bins</p>
                </div>

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4">
                  <div className="flex items-center justify-between text-xs text-amber-300">
                    <span>Low Stock Attention</span>
                    <IconTrendingUp className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-amber-200">2 SKUs</p>
                  <p className="mt-1 text-[11px] text-amber-400/80">Safety buffer breached</p>
                </div>
              </div>

              {/* Sample Table */}
              <div className="mt-6 rounded-lg border border-[#222734] overflow-hidden">
                <div className="border-b border-[#222734] bg-[#141822] px-4 py-2.5 text-[11px] font-medium text-zinc-400 flex justify-between">
                  <span>Priority Restock Queue</span>
                  <span>Safety Threshold</span>
                </div>
                <div className="divide-y divide-[#1e2330] bg-[#11141c] text-xs">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <div>
                        <p className="font-medium text-zinc-200">Industrial Sensor X-100</p>
                        <p className="font-mono text-[10px] text-zinc-400">SKU: IND-SEN-100</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[11px] font-medium text-rose-300">
                        2 units remaining (Buffer: 10)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <div>
                        <p className="font-medium text-zinc-200">Hydraulic Fitting 0.5&quot;</p>
                        <p className="font-mono text-[10px] text-zinc-400">SKU: HYD-FIT-05</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                        4 units remaining (Buffer: 5)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="mt-24">
          <div className="text-left md:text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Engineered for dependable stock operations
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Straightforward tools to manage catalog data, set buffers, and secure warehouse operations.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[#232836] bg-[#12151c] p-6 hover:border-[#32394c] transition">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                <IconDashboard className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">Live Stock Analytics</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Instant visibility into SKU volumes, physical units on hand, and threshold alerts calculated automatically on every transaction.
              </p>
            </div>

            <div className="rounded-xl border border-[#232836] bg-[#12151c] p-6 hover:border-[#32394c] transition">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                <IconShield className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">Multi-Tenant Isolation</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Every query is strictly organization-scoped. Sensitive tenant catalog records and thresholds cannot leak across accounts.
              </p>
            </div>

            <div className="rounded-xl border border-[#232836] bg-[#12151c] p-6 hover:border-[#32394c] transition">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                <IconLayers className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">SKU & Price Intelligence</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Maintain accurate unit cost and selling price histories with financial decimal precision and instant gross margin calculations.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture & Security section */}
        <section id="architecture" className="mt-20 rounded-xl border border-[#232836] bg-[#12151c] p-8">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Architecture</span>
            <h3 className="mt-1 text-xl font-bold text-white">Backend-For-Frontend (BFF) Security</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              StockFlow utilizes an encrypted, same-origin BFF proxy architecture. Access tokens remain in secure HTTP-only cookies, preventing browser-side token extraction while guaranteeing CSRF protection.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3 pt-6 border-t border-[#20242e] text-xs">
            <div>
              <p className="font-medium text-zinc-200">Password Encryption</p>
              <p className="mt-1 text-zinc-400 text-[11px]">Argon2id hashing with parameterized memory hardness.</p>
            </div>
            <div>
              <p className="font-medium text-zinc-200">Session Rotation</p>
              <p className="mt-1 text-zinc-400 text-[11px]">Strict refresh rotation with replay detection safeguards.</p>
            </div>
            <div>
              <p className="font-medium text-zinc-200">Zero Data Leakage</p>
              <p className="mt-1 text-zinc-400 text-[11px]">Tenant foreign keys enforced on all inventory queries.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#20242e] bg-[#0e1117] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-white font-mono text-[10px] font-bold">
              SF
            </div>
            <span className="font-medium text-zinc-200">StockFlow</span>
            <span className="text-zinc-600">·</span>
            <span>Inventory Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-zinc-200 transition">Sign in</Link>
            <Link href="/register" className="hover:text-zinc-200 transition">Register</Link>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-200 transition"
            >
              API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
