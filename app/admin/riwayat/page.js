"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

/* ========== ICON ========== */
const IconOrders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
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
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconInbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export default function RiwayatPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { load(); }, [date]);

  async function load() {
    setLoading(true);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false });

    setOrders(data || []);
    setLoading(false);
  }

  const rp = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const fmtTime = (s) =>
    new Date(s).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const totalSelesai = orders.filter((o) => o.status === "selesai");
  const totalPendapatan = totalSelesai.reduce((s, o) => s + o.total, 0);
  const totalDibatalkan = orders.filter((o) => o.status === "dibatalkan").length;

  function exportCSV() {
    const rows = [
      ["Waktu", "Customer", "Meja", "Status", "Total", "Catatan"],
      ...orders.map((o) => [
        new Date(o.created_at).toLocaleString("id-ID"),
        o.customer_name,
        o.table_number || "-",
        o.status,
        o.total,
        (o.notes || "").replace(/,/g, ";"),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `riwayat-${date}.csv`;
    link.click();
  }

  const statusColors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    diproses: "bg-blue-100 text-blue-700 border-blue-200",
    selesai: "bg-green-100 text-green-700 border-green-200",
    dibatalkan: "bg-red-100 text-red-700 border-red-200",
  };

  const summary = [
    { label: "Total Pesanan", value: orders.length, Icon: IconOrders, color: "from-blue-500 to-cyan-500" },
    { label: "Selesai", value: totalSelesai.length, Icon: IconCheck, color: "from-green-500 to-emerald-500" },
    { label: "Dibatalkan", value: totalDibatalkan, Icon: IconX, color: "from-red-500 to-rose-500" },
    { label: "Pendapatan", value: rp(totalPendapatan), Icon: IconWallet, color: "from-[#d4a24c] to-[#e8bd6e]" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Riwayat Pesanan</h1>
          <p className="text-slate-500 mt-1 text-sm">Data pesanan berdasarkan tanggal</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#d4a24c] focus:ring-2 focus:ring-[#d4a24c]/20 text-sm font-medium"
          />
          <button
            onClick={exportCSV}
            disabled={orders.length === 0}
            className="px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <IconDownload /> CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summary.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md`}>
              <s.Icon />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">
              {s.label}
            </p>
            <p className="text-lg sm:text-xl font-bold text-slate-800 mt-0.5 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wider">Waktu</th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wider">Meja</th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-bold uppercase text-[11px] tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-4">
                      <div className="h-6 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <IconInbox />
                    </div>
                    <p className="text-slate-500 font-medium">Tidak ada pesanan</p>
                    <p className="text-slate-400 text-sm mt-1">pada tanggal ini</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-medium">{fmtTime(o.created_at)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{o.customer_name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#d4a24c]/10 text-[#d4a24c] font-bold text-xs">
                        {o.table_number || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider ${statusColors[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{rp(o.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  }
