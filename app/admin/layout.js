"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const MENU = [
  { href: "/admin", label: "Overview", icon: "🏠" },
  { href: "/admin/orders", label: "Pesanan", icon: "📋" },
  { href: "/admin/dapur", label: "Dapur", icon: "🍳" },
  { href: "/admin/menu", label: "Kelola Menu", icon: "🍽️" },
  { href: "/admin/meja", label: "Meja & QR", icon: "🪑" },
  { href: "/admin/riwayat", label: "Riwayat", icon: "🕒" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Halaman login: langsung tampilkan
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }

    // Halaman admin: cek session
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        window.location.href = "/admin/login";
      } else {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  // Kalau di halaman login, tampilkan tanpa sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Kalau belum ready, tampilkan loading
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d4a24c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] flex items-center justify-center font-bold text-[#1a1408]">
              W
            </div>
            <div>
              <p className="font-bold">Barockah Admin</p>
              <p className="text-xs text-slate-400">Panel Kontrol</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {MENU.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-bold">Barockah Admin</span>
          <button onClick={handleLogout} className="text-sm text-slate-400">
            Logout
          </button>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden sticky top-[52px] z-30 bg-slate-800 overflow-x-auto flex gap-1 p-2">
          {MENU.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                  active ? "bg-[#d4a24c] text-[#1a1408]" : "text-slate-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
