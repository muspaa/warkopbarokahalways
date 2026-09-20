"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Riwayat Pesanan</h1>
          <p className="text-slate-500 mt-1">Data pesanan berdasarkan tanggal</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#d4a24c]"
          />
          <button
            onClick={exportCSV}
            disabled={orders.length === 0}
            className="px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold disabled:opacity-50"
          >
            ⬇ CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Pesanan" value={orders.length} color="from-blue-500 to-cyan-500" icon="📋" />
        <SummaryCard label="Selesai" value={totalSelesai.length} color="from-green-500 to-emerald-500" icon="✅" />
        <SummaryCard label="Dibatalkan" value={totalDibatalkan} color="from-red-500 to-rose-500" icon="❌" />
        <SummaryCard label="Pendapatan" value={rp(totalPendapatan)} color="from-fuchsia-500 to-pink-500" icon="💰" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Waktu</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold">Meja</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
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
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <div className="text-5xl mb-2">📭</div>
                    Tidak ada pesanan pada tanggal ini
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">
                      {fmtTime(o.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {o.customer_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {o.table_number || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
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

function SummaryCard({ label, value, color, icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div
        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-lg`}
      >
        {icon}
      </div>
      <p className="text-xs text-slate-500 mt-2 font-medium uppercase">
        {label}
      </p>
      <p className="text-xl font-bold text-slate-800 mt-0.5">{value}</p>
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
      className={`text-xs font-semibold px-2 py-1 rounded-full ${
        map[status] || "bg-slate-100"
      }`}
    >
      {status}
    </span>
  );
}