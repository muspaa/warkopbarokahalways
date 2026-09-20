"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "pending", label: "Pending" },
  { key: "diproses", label: "Diproses" },
  { key: "selesai", label: "Selesai" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

/* ========== ICON ========== */
const IconInbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconNote = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("semua");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        setNewOrderAlert(payload.new);
        playNotification();
        loadOrders();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => loadOrders())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  function playNotification() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      o.type = "sine";
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id);
    loadOrders();
  }

  async function openDetail(order) {
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    setDetail({ ...order, items: data || [] });
  }

  const rp = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const fmtDate = (s) =>
    new Date(s).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

  const filtered = filter === "semua" ? orders : orders.filter((o) => o.status === filter);

  const statusColors = {
    pending: "text-amber-700 bg-amber-100 border-amber-200",
    diproses: "text-blue-700 bg-blue-100 border-blue-200",
    selesai: "text-green-700 bg-green-100 border-green-200",
    dibatalkan: "text-red-700 bg-red-100 border-red-200",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Notifikasi pesanan baru */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-[100] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-4 max-w-sm animate-[slideIn_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <IconBell />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Pesanan Baru!</p>
              <p className="text-xs text-white/90 truncate">
                Meja {newOrderAlert.table_number} · {newOrderAlert.customer_name}
              </p>
              <p className="text-lg font-bold mt-1">{rp(newOrderAlert.total)}</p>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-white/80 hover:text-white shrink-0"
            >
              <IconClose />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Manajemen Pesanan</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Kelola semua pesanan masuk</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {TABS.map((t) => {
          const count = t.key === "semua" ? orders.length : orders.filter((o) => o.status === t.key).length;
          const active = filter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {t.label}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-slate-100"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <IconInbox />
          </div>
          <p className="text-slate-500 font-medium">Tidak ada pesanan</p>
          <p className="text-slate-400 text-sm mt-1">
            Pesanan akan muncul di sini saat pelanggan memesan
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] flex items-center justify-center font-bold text-lg shrink-0">
                  {o.table_number || "?"}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider ${statusColors[o.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                >
                  {o.status}
                </span>
              </div>

              <p className="font-bold text-slate-800 truncate">{o.customer_name}</p>
              <p className="text-xs text-slate-500">Meja {o.table_number || "-"}</p>

              {o.notes && (
                <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <IconNote />
                  <span className="flex-1 line-clamp-2">{o.notes}</span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xl font-bold text-[#d4a24c]">{rp(o.total)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{fmtDate(o.created_at)}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openDetail(o)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Detail
                </button>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="flex-1 py-2 px-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 cursor-pointer focus:border-[#d4a24c] outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="diproses">Diproses</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Detail Pesanan</h3>
              <button
                onClick={() => setDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <IconClose />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Customer</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{detail.customer_name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Meja</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{detail.table_number || "-"}</p>
                </div>
              </div>

              {detail.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">Catatan</p>
                  <p className="text-sm text-slate-700">{detail.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Pesanan</p>
                <div className="space-y-2">
                  {detail.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-xl p-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">{it.menu_name}</p>
                        <p className="text-xs text-slate-500">
                          {it.quantity} × {rp(it.price)}
                          {it.variant_temp && ` · ${it.variant_temp}`}
                          {it.variant_sugar && ` · Gula ${it.variant_sugar}`}
                        </p>
                      </div>
                      <p className="font-bold text-slate-800 shrink-0 ml-2">{rp(it.price * it.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Total</span>
              <span className="text-xl font-bold text-[#d4a24c]">{rp(detail.total)}</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
  }
