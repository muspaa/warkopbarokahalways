"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    pending: 0,
    processing: 0,
    done: 0,
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
        processing: orders.filter((o) => o.status === "diproses").length,
        done: orders.filter((o) => o.status === "selesai").length,
        revenue: orders
          .filter((o) => o.status === "selesai")
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
    { label: "Pesanan Hari Ini", value: stats.todayOrders, icon: "📋", color: "from-blue-500 to-cyan-500" },
    { label: "Diproses", value: stats.processing, icon: "⏳", color: "from-amber-500 to-orange-500" },
    { label: "Selesai", value: stats.done, icon: "✅", color: "from-green-500 to-emerald-500" },
    { label: "Pendapatan", value: rp(stats.revenue), icon: "💰", color: "from-fuchsia-500 to-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Overview</h1>
        <p className="text-slate-500 mt-1">Ringkasan aktivitas warung hari ini</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-xl shadow-lg`}
            >
              {c.icon}
            </div>
            <p className="text-xs text-slate-500 mt-3 font-medium uppercase">
              {c.label}
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {loading ? "..." : c.value}
            </p>
          </div>
        ))}
      </div>

      {stats.pending > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
              🔔
            </div>
            <div>
              <p className="font-bold">{stats.pending} pesanan menunggu</p>
              <p className="text-white/80 text-sm">Segera konfirmasi</p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-xl bg-white text-orange-600 font-semibold text-sm"
          >
            Lihat
          </Link>
        </div>
      )}

      <div>
        <h2 className="font-bold text-slate-800 mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/admin/orders", label: "Kelola Pesanan", icon: "📋", color: "bg-blue-50 text-blue-600" },
            { href: "/admin/dapur", label: "Layar Dapur", icon: "🍳", color: "bg-amber-50 text-amber-600" },
            { href: "/admin/menu", label: "Tambah Menu", icon: "➕", color: "bg-green-50 text-green-600" },
            { href: "/admin/meja", label: "QR Meja", icon: "📱", color: "bg-purple-50 text-purple-600" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`${a.color} rounded-2xl p-4 flex flex-col items-start gap-2 hover:scale-[1.02] transition-transform`}
            >
              <span className="text-3xl">{a.icon}</span>
              <span className="font-semibold text-sm">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-sm text-[#d4a24c] font-semibold">
            Lihat semua →
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="p-10 text-center text-slate-400">Belum ada pesanan hari ini</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
                  {o.table_number || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {o.customer_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Meja {o.table_number || "-"} · {timeAgo(o.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{rp(o.total)}</p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    diproses: "bg-blue-100 text-blue-700",
    selesai: "bg-green-100 text-green-700",
    dibatalkan: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
        map[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}