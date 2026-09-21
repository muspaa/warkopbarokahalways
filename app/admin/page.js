"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

/* ========== ICON ========== */
const IconInbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconWallet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);
const IconKitchen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 2v6a3 3 0 0 0 3 3v11" />
    <path d="M9 2v6" />
    <path d="M18 2c-1.5 3-1.5 6 0 9v11" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function AdminOverview() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const channel = supabase
      .channel("orders-overview")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadStats()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function loadStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    if (orders) {
      setStats({
        todayOrders: orders.length,
        pending: orders.filter((o) => o.status === "pending").length,
        accepted: orders.filter((o) => o.status === "diterima").length,
        rejected: orders.filter((o) => o.status === "ditolak").length,
        revenue: orders
          .filter((o) => o.status === "diterima")
          .reduce((s, o) => s + o.total, 0),
      });
      setRecentOrders(orders.slice(0, 5));
    }
    setLoading(false);
  }

  const rp = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  function timeAgo(d) {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  }

  const cards = [
    { label: "Pesanan Hari Ini", value: stats.todayOrders, Icon: IconInbox, color: "from-blue-500 to-cyan-500" },
    { label: "Menunggu", value: stats.pending, Icon: IconBell, color: "from-amber-500 to-orange-500" },
    { label: "Diterima", value: stats.accepted, Icon: IconCheck, color: "from-green-500 to-emerald-500" },
    { label: "Pendapatan", value: rp(stats.revenue), Icon: IconWallet, color: "from-fuchsia-500 to-pink-500" },
  ];

  const quickActions = [
    { href: "/admin/dapur", label: "Layar Dapur", Icon: IconKitchen },
    { href: "/admin/menu", label: "Kelola Menu", Icon: IconMenu },
    { href: "/admin/meja", label: "Meja & QR", Icon: IconTable },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Overview</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Ringkasan aktivitas warkop hari ini
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center`}>
              <c.Icon />
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-medium uppercase tracking-wider">
              {c.label}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 truncate">
              {loading ? "..." : c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Alert Pending */}
      {stats.pending > 0 && (
        <Link
          href="/admin/dapur"
          className="block bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <IconBell />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base sm:text-lg">
                {stats.pending} pesanan menunggu konfirmasi
              </p>
              <p className="text-white/80 text-xs sm:text-sm">
                Buka layar dapur untuk terima atau tolak
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-sm font-semibold shrink-0">
              Buka <IconArrowRight />
            </div>
          </div>
        </Link>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col items-start gap-3 hover:border-slate-400 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Icon />
              </div>
              <span className="font-semibold text-sm text-slate-800">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Pesanan Terbaru</h2>
          <Link
            href="/admin/riwayat"
            className="text-sm text-slate-600 font-semibold hover:text-slate-900 flex items-center gap-1"
          >
            Riwayat <IconArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <IconInbox />
            </div>
            <p className="text-slate-500 text-sm">Belum ada pesanan hari ini</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href="/admin/dapur"
                className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">
                  {o.table_number || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate text-sm sm:text-base">
                    {o.customer_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Meja {o.table_number || "-"} · {timeAgo(o.created_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-800 text-sm sm:text-base">
                    {rp(o.total)}
                  </p>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    diterima: "bg-green-100 text-green-700 border-green-200",
    ditolak: "bg-red-100 text-red-700 border-red-200",
  };
  const label = {
    pending: "Menunggu",
    diterima: "Diterima",
    ditolak: "Ditolak",
  };
  return (
    <span
      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 uppercase tracking-wider ${
        map[status] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {label[status] || status}
    </span>
  );
  }
