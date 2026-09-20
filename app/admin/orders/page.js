"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const TABS = ["semua", "pending", "diproses", "selesai", "dibatalkan"];

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
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setNewOrderAlert(payload.new);
          playNotification();
          loadOrders();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => loadOrders()
      )
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

  const filtered =
    filter === "semua" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-5">
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-[100] bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-2xl p-5 max-w-sm animate-pulse">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🔔</div>
            <div className="flex-1">
              <p className="font-bold">Pesanan Baru!</p>
              <p className="text-sm">
                Meja {newOrderAlert.table_number} · {newOrderAlert.customer_name}
              </p>
              <p className="text-lg font-bold mt-1">{rp(newOrderAlert.total)}</p>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-white/80 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Pesanan</h1>
        <p className="text-slate-500 mt-1">Kelola semua pesanan masuk</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => {
          const count =
            t === "semua"
              ? orders.length
              : orders.filter((o) => o.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
                filter === t
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span
                className={`ml-2 text-xs ${
                  filter === t ? "text-white/70" : "text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-5xl mb-2">📭</div>
          <p className="text-slate-500">Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] flex items-center justify-center font-bold text-lg">
                  {o.table_number || "?"}
                </div>
                <StatusBadge status={o.status} />
              </div>
              <p className="font-bold text-slate-800">{o.customer_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Meja {o.table_number || "-"}
              </p>
              {o.notes && (
                <p className="text-xs text-slate-600 mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                  📝 {o.notes}
                </p>
              )}
              <p className="text-lg font-bold text-[#d4a24c] mt-3">
                {rp(o.total)}
              </p>
              <p className="text-xs text-slate-400 mt-1">{fmtDate(o.created_at)}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openDetail(o)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700"
                >
                  Detail
                </button>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="flex-1 py-2 px-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white"
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

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDetail(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Detail Pesanan</h3>
              <button
                onClick={() => setDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Customer</p>
                  <p className="font-semibold">{detail.customer_name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Meja</p>
                  <p className="font-semibold">{detail.table_number || "-"}</p>
                </div>
              </div>
              {detail.notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm">
                  <p className="text-xs text-amber-700 font-semibold mb-1">
                    Catatan
                  </p>
                  <p>{detail.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Item Pesanan
                </p>
                <div className="space-y-2">
                  {detail.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between text-sm bg-slate-50 rounded-xl p-3"
                    >
                      <div>
                        <p className="font-semibold">{it.menu_name}</p>
                        <p className="text-xs text-slate-500">
                          {it.quantity} × {rp(it.price)}
                          {it.variant_temp && ` · ${it.variant_temp}`}
                          {it.variant_sugar && ` · Gula ${it.variant_sugar}`}
                        </p>
                      </div>
                      <p className="font-bold">
                        {rp(it.price * it.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-600">Total</span>
              <span className="text-xl font-bold text-[#d4a24c]">
                {rp(detail.total)}
              </span>
            </div>
          </div>
        </div>
      )}
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