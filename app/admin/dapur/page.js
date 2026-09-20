"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders()
      )
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
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", ids);
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
    const mins = Math.floor((now - new Date(dateStr).getTime()) / 60000);
    return mins >= 15;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🍳 Layar Dapur</h1>
          <p className="text-slate-500 mt-1">Pesanan aktif yang perlu disiapkan</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500">Antrian</p>
          <p className="text-2xl font-bold text-[#d4a24c]">{orders.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-6xl mb-3">✨</div>
          <p className="text-lg font-semibold text-slate-700">
            Semua pesanan selesai!
          </p>
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
                className={`rounded-2xl p-5 shadow-sm border-2 transition-all ${
                  urgent
                    ? "border-red-400 bg-red-50"
                    : isProc
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] flex items-center justify-center font-bold text-2xl">
                    {o.table_number || "?"}
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        isProc ? "bg-blue-500 text-white" : "bg-amber-500 text-white"
                      }`}
                    >
                      {isProc ? "DIPROSES" : "BARU"}
                    </span>
                    <p
                      className={`text-xs mt-1 font-semibold ${
                        urgent ? "text-red-600" : "text-slate-500"
                      }`}
                    >
                      ⏱ {elapsed(o.created_at)}
                    </p>
                  </div>
                </div>

                <p className="font-bold text-slate-800 mb-3">{o.customer_name}</p>

                <div className="bg-white/70 rounded-xl p-3 my-3 space-y-2 max-h-40 overflow-y-auto">
                  {(itemsMap[o.id] || []).map((it) => (
                    <div key={it.id} className="flex items-center gap-2 text-sm">
                      <span className="w-7 h-7 rounded-lg bg-[#d4a24c] text-[#1a1408] font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {it.quantity}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{it.menu_name}</p>
                        {(it.variant_temp || it.variant_sugar) && (
                          <p className="text-xs text-[#d4a24c]">
                            {it.variant_temp}
                            {it.variant_sugar && ` · Gula ${it.variant_sugar}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {o.notes && (
                  <p className="text-xs bg-amber-100 text-amber-800 rounded-lg p-2 mb-3">
                    📝 {o.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  {!isProc && (
                    <button
                      onClick={() => markProcessing(o.id)}
                      className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm"
                    >
                      Mulai Masak
                    </button>
                  )}
                  <button
                    onClick={() => markDone(o.id)}
                    className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm"
                  >
                    Selesai ✓
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