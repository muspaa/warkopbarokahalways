"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const IconOrders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconWallet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconInbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export default function RiwayatPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    load();
  }, [date]);

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
    new Date(s).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const accepted = orders.filter((o) => o.status === "diterima");
  const rejected = orders.filter((o) => o.status === "ditolak");
  const revenue = accepted.reduce((s, o) => s + o.total, 0);

  function exportCSV() {
    const rows = [
      ["Waktu", "Customer", "Meja", "Status", "Pembayaran", "Total", "Catatan"],
      ...orders.map((o) => [
        new Date(o.created_at).toLocaleString("id-ID"),
        o.customer_name,
        o.table_number || "-",
        o.status,
        o.payment_method || "-",
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
    pending: {
      bg: "rgba(245, 158, 11, 0.15)",
      color: "#fcd34d",
      border: "1px solid rgba(245, 158, 11, 0.3)",
    },
    diterima: {
      bg: "rgba(34, 197, 94, 0.15)",
      color: "#86efac",
      border: "1px solid rgba(34, 197, 94, 0.3)",
    },
    ditolak: {
      bg: "rgba(239, 68, 68, 0.15)",
      color: "#fca5a5",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
  };
  const statusLabels = {
    pending: "Menunggu",
    diterima: "Diterima",
    ditolak: "Ditolak",
  };

  const summary = [
    { label: "Total Pesanan", value: orders.length, Icon: IconOrders, color1: "#3b82f6", color2: "#06b6d4" },
    { label: "Diterima", value: accepted.length, Icon: IconCheck, color1: "#22c55e", color2: "#10b981" },
    { label: "Ditolak", value: rejected.length, Icon: IconX, color1: "#ef4444", color2: "#b91c1c" },
    { label: "Pendapatan", value: rp(revenue), Icon: IconWallet, color1: "#a855f7", color2: "#7c3aed" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-red-50 text-red-glow">
            Riwayat Pesanan
          </h1>
          <p className="text-red-300/60 mt-1 text-sm">
            Data pesanan berdasarkan tanggal
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-3 rounded-xl text-red-50 font-medium outline-none transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(239, 68, 68, 0.16)",
              colorScheme: "dark",
            }}
          />
          <button
            onClick={exportCSV}
            disabled={orders.length === 0}
            className="px-4 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #ef4444, #b91c1c)",
              boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
            }}
          >
            <IconDownload /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summary.map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
              style={{
                background: `linear-gradient(135deg, ${s.color1}, ${s.color2})`,
                boxShadow: `0 8px 20px ${s.color1}40`,
              }}
            >
              <s.Icon />
            </div>
            <p className="text-[10px] text-red-300/60 mt-2 font-bold uppercase tracking-wider">
              {s.label}
            </p>
            <p className="text-lg sm:text-xl font-bold text-red-50 mt-0.5 truncate">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead
              className="text-red-300/60 border-b border-red-500/20"
              style={{ background: "rgba(255, 255, 255, 0.02)" }}
            >
              <tr>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wider">
                  Waktu
                </th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wider">
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wider">
                  Meja
                </th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-wider">
                  Bayar
                </th>
                <th className="text-right px-4 py-3 font-bold uppercase text-[11px] tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/10">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <div
                        className="h-6 rounded animate-pulse"
                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                      />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-red-300/50"
                      style={{ background: "rgba(255, 255, 255, 0.05)" }}
                    >
                      <IconInbox />
                    </div>
                    <p className="text-red-100 font-medium">
                      Tidak ada pesanan
                    </p>
                    <p className="text-red-300/60 text-sm mt-1">
                      pada tanggal ini
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-red-500/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-red-300/60 font-medium">
                      {fmtTime(o.created_at)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-50">
                      {o.customer_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-xs"
                        style={{
                          background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                        }}
                      >
                        {o.table_number || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                        style={statusColors[o.status] || statusColors.pending}
                      >
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                        style={
                          o.payment_method === "qris"
                            ? {
                                background: "rgba(168, 85, 247, 0.15)",
                                color: "#c4b5fd",
                              }
                            : {
                                background: "rgba(34, 197, 94, 0.15)",
                                color: "#86efac",
                              }
                        }
                      >
                        {o.payment_method === "qris" ? "QRIS" : "CASH"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-50">
                      {rp(o.total)}
                    </td>
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
