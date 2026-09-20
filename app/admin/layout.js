"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  if (pathname === "/admin/login") return <>{children}</>;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
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

      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-bold">Barockah Admin</span>
          <button onClick={handleLogout} className="text-sm text-slate-400">
            Logout
          </button>
        </div>
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