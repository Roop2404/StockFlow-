"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  IconAlertTriangle,
  IconBuilding,
  IconDashboard,
  IconLogout,
  IconMenu,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconX,
} from "@/components/ui/Icons";

export function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status, logout } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setLogoutError("");
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Unable to sign out");
    }
  }

  if (status !== "authenticated" || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0b0d11] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <IconRefresh className="h-6 w-6 animate-spin text-zinc-400" />
          <p className="text-xs font-medium text-zinc-400">Loading workspace…</p>
        </div>
      </main>
    );
  }

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: IconDashboard },
    { label: "Products Catalog", href: "/products", icon: IconPackage },
    { label: "Add Product", href: "/products/new", icon: IconPlus },
    { label: "Settings", href: "/settings", icon: IconSettings },
  ];

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U"
    );
  };

  const getPageSection = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/products") return "Products";
    if (pathname === "/products/new") return "New Product";
    if (pathname.startsWith("/products/")) return "Product Detail";
    if (pathname === "/settings") return "Settings";
    return "Workspace";
  };

  return (
    <div className="flex min-h-screen bg-[#0b0d11] text-zinc-100">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#20242e] bg-[#0e1117] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-15 items-center justify-between border-b border-[#20242e] px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-white">
              <IconPackage className="h-4.5 w-4.5 text-zinc-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-zinc-100">StockFlow</span>
              <span className="text-[10px] text-zinc-400 font-mono">INVENTORY</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 lg:hidden"
            aria-label="Close navigation"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Tenant Organization Switcher */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2.5 rounded-lg border border-[#20242e] bg-[#141720] px-3 py-2.5 text-left">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-zinc-400">
              <IconBuilding className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-200">{user.organization.name}</p>
              <p className="text-[10px] text-zinc-400">Organization Tenant</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-3">
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Workspace
          </p>
          {navLinks.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || (item.href !== "/dashboard" && item.href !== "/products/new" && pathname.startsWith(item.href) && pathname !== "/products/new");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-[#1d222e] text-white border border-[#2c3346]"
                    : "text-zinc-400 hover:bg-[#151821] hover:text-zinc-200"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition ${
                    isActive ? "text-blue-400" : "text-zinc-400 group-hover:text-zinc-300"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card Footer */}
        <div className="border-t border-[#20242e] p-3">
          <div className="flex items-center justify-between rounded-lg bg-[#141720] border border-[#20242e] p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-zinc-200">{user.name}</p>
                <p className="truncate text-[10px] text-zinc-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-rose-400 transition"
            >
              <IconLogout className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#20242e] bg-[#0b0d11]/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 lg:hidden"
              aria-label="Open navigation"
            >
              <IconMenu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-medium text-zinc-300">{user.organization.name}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200">{getPageSection()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#232836] bg-[#12151c] px-2.5 py-1 text-[11px] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Workspace Connected</span>
            </div>

            <Link
              href="/products/new"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition active:scale-[0.98]"
            >
              <IconPlus className="h-3.5 w-3.5" />
              <span>New Product</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {logoutError && (
              <div role="alert" className="mb-6 flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                <IconAlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{logoutError}</span>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
