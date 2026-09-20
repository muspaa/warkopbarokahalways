"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const IconKitchen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M6 2v6a3 3 0 0 0 3 3v11" />
    <path d="M9 2v6" />
    <path d="M18 2c-1.5 3-1.5 6 0 9v11" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconFire = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export default function DapurPage() {
  const [orders, setOrders] = useState([]);
  const [itemsMap, setItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    loadOrders();
    const tick = setInterval(() => setNow(Date.now()), 10000);
    const channel = supabase
      .channel("dapur-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadOrders())
      .subscribe();
    return () => {
      clearInterval(tick);
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadOrders() {
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "diproses"])
      .order("created_at", { ascending: true });

    if (orders && orders.length > 0) {
      const ids = orders.map((o) => o.id);
      const { data: items } = await supabase.from("order_items").select("*").in("order_id", ids);
      const map = {};
      (items || []).forEach((it) => {
        if (!map[it.order_id]) map[it.order_id] = [];
        map[it.order_id].push(it);
      });
      setItemsMap(map);
    } else {
      setItemsMap({});
    }
    setOrders(orders || []);
    setLoading(false);
  }

  async function markDone(id) {
    await supabase.from("orders").update({ status: "selesai" }).eq("id", id);
    loadOrders();
  }
  async function markProcessing(id) {
    await supabase.from("orders").update({ status: "diproses" }).eq("id", id);
    loadOrders();
  }

  function elapsed(dateStr) {
    const mins = Math.floor((now - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "baru";
    if (mins < 60) return `${mins} mnt`;
    return `${Math.floor(mins / 60)} jam`;
  }
  function isUrgent(dateStr) {
    return Math.floor((now - new Date(dateStr).getTime()) / 60000) >= 15;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Layar Dapur</h1>
          <p className="text-slate-500 mt-1 text-sm">Pesanan aktif yang perlu disiapkan</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-2 border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] flex items-center justify-center">
            <IconKitchen />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Antrian</p>
            <p className="text-lg font-bold text-slate-800 leading-none">{orders.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-green-600">
            <IconCheck />
          </div>
          <p className="text-lg font-bold text-slate-700">Semua pesanan selesai</p>
          <p className="text-slate-400 text-sm mt-1">Tidak ada antrian saat ini</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => {
            const urgent = isUrgent(o.created_at);
            const isProc = o.status === "diproses";
            return (
              <div
                key={o.id}
                className={`rounded-2xl p-5 border-2 transition-all ${
                  urgent
                    ? "border-red-400 bg-red-50"
                    : isProc
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] flex items-center justify-center font-bold text-2xl shadow-md">
                    {o.table_number || "?"}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider text-white ${
                        isProc ? "bg-blue-500" : "bg-amber-500"
                      }`}
                    >
                      {isProc ? "Diproses" : "Baru"}
                    </span>
                    <p className={`text-xs mt-1.5 font-semibold flex items-center justify-end gap-1 ${urgent ? "text-red-600" : "text-slate-500"}`}>
                      <IconClock /> {elapsed(o.created_at)}
                    </p>
                  </div>
                </div>

                <p className="font-bold text-slate-800 mb-3 truncate">{o.customer_name}</p>

                <div className="bg-white/70 rounded-xl p-3 mb-3 space-y-2 max-h-40 overflow-y-auto">
                  {(itemsMap[o.id] || []).map((it) => (
                    <div key={it.id} className="flex items-center gap-2 text-sm">
                      <span className="w-7 h-7 rounded-lg bg-[#d4a24c] text-[#1a1408] font-bold flex items-center justify-center text-xs shrink-0">
                        {it.quantity}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{it.menu_name}</p>
                        {(it.variant_temp || it.variant_sugar) && (
                          <p className="text-[11px] text-[#d4a24c]">
                            {it.variant_temp}
                            {it.variant_sugar && ` · Gula ${it.variant_sugar}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {o.notes && (
                  <p className="text-xs bg-amber-100 border border-amber-200 text-amber-800 rounded-lg p-2 mb-3 line-clamp-2">
                    {o.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  {!isProc && (
                    <button
                      onClick={() => markProcessing(o.id)}
                      className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <IconFire /> Mulai
                    </button>
                  )}
                  <button
                    onClick={() => markDone(o.id)}
                    className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <IconCheck /> Selesai
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
    }
