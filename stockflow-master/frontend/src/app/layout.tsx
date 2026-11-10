import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "StockFlow — Inventory & Catalog Management",
  description: "Real-time multi-tenant inventory control, safety threshold alerts, and SKU management.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#0b0d11] font-sans text-zinc-100 antialiased selection:bg-blue-600/30 selection:text-blue-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
