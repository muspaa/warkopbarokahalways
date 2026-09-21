"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

/* ========== ICON ========== */
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
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconNote = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconCash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);
const IconQRIS = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <line x1="14" y1="14" x2="14" y2="21" />
    <line x1="18" y1="14" x2="18" y2="18" />
    <line x1="21" y1="14" x2="21" y2="21" />
    <line x1="14" y1="21" x2="21" y2="21" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconInbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export default function DapurPage() {
  const [orders, setOrders] = useState([]);
  const [itemsMap, setItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [detail, setDetail] = useState(null);

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
    // HANYA tampilkan pesanan "pending" (belum direspon)
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (ordersData && ordersData.length > 0) {
      const ids = ordersData.map((o) => o.id);
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
    setOrders(ordersData || []);
    setLoading(false);
  }

  // TERIMA pesanan → status "diterima"
  async function acceptOrder(id) {
    await supabase.from("orders").update({ status: "diterima" }).eq("id", id);
    loadOrders();
  }

  // TOLAK pesanan → status "ditolak"
  async function rejectOrder(id) {
    if (!confirm("Tolak pesanan ini?")) return;
    await supabase.from("orders").update({ status: "ditolak" }).eq("id", id);
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

  const rp = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Layar Dapur</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Terima atau tolak pesanan yang masuk
          </p>
        </div>
        <div className="bg-white rounded-xl px-5 py-3 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <IconInbox />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Pesanan Baru
            </p>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {orders.length}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-green-600">
            <IconCheck />
          </div>
          <p className="text-lg font-bold text-slate-700">Tidak ada pesanan baru</p>
          <p className="text-slate-400 text-sm mt-1">
            Pesanan masuk akan muncul otomatis di sini
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => {
            const urgent = isUrgent(o.created_at);
            const items = itemsMap[o.id] || [];
            const isQris = o.payment_method === "qris";
            const isPaid = o.payment_status === "paid";

            return (
              <div
                key={o.id}
                className={`rounded-2xl p-4 border-2 transition-all flex flex-col ${
                  urgent ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                }`}
              >
                {/* Header Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center font-bold text-2xl shrink-0">
                      {o.table_number || "?"}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                        Meja
                      </p>
                      <p className="font-bold text-slate-800 text-base truncate max-w-[100px]">
                        {o.customer_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider text-white bg-amber-500">
                      Baru
                    </span>
                    <p
                      className={`text-xs mt-1.5 font-semibold flex items-center justify-end gap-1 ${
                        urgent ? "text-red-600" : "text-slate-500"
                      }`}
                    >
                      <IconClock /> {elapsed(o.created_at)}
                    </p>
                  </div>
                </div>

                {/* Pembayaran */}
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-bold ${
                    isQris
                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                      : "bg-green-100 text-green-800 border border-green-200"
                  }`}
                >
                  {isQris ? <IconQRIS /> : <IconCash />}
                  <span>{isQris ? "QRIS" : "CASH"}</span>
                  {isQris && isPaid && (
                    <span className="ml-auto text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">
                      LUNAS
                    </span>
                  )}
                  {isQris && !isPaid && (
                    <span className="ml-auto text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      BELUM BAYAR
                    </span>
                  )}
                  {!isQris && (
                    <span className="ml-auto text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      DI KASIR
                    </span>
                  )}
                </div>

                {/* Items Preview */}
                <div className="bg-white rounded-xl p-3 mb-3 space-y-1.5 max-h-32 overflow-y-auto border border-slate-200">
                  {items.slice(0, 4).map((it) => (
                    <div key={it.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {it.quantity}
                      </span>
                      <span className="font-medium text-slate-800 truncate">
                        {it.menu_name}
                      </span>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <p className="text-[11px] text-slate-500 italic">
                      +{items.length - 4} item lainnya
                    </p>
                  )}
                </div>

                {/* Catatan */}
                {o.notes && (
                  <div className="flex items-start gap-2 bg-amber-100 border border-amber-200 text-amber-800 rounded-lg p-2 mb-3 text-xs">
                    <IconNote />
                    <span className="flex-1 line-clamp-2">{o.notes}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between mb-3 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold">
                    Total
                  </span>
                  <span className="font-bold text-slate-900 text-lg">
                    {rp(o.total)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => rejectOrder(o.id)}
                      className="py-3 rounded-xl bg-white border-2 border-red-500 text-red-600 font-bold text-sm hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <IconX /> Tolak
                    </button>
                    <button
                      onClick={() => acceptOrder(o.id)}
                      className="py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <IconCheck /> Terima
                    </button>
                  </div>

                  <button
                    onClick={() => setDetail(o)}
                    className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
                  >
                    Lihat Detail Lengkap
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDetail(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Detail Pesanan</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Meja {detail.table_number} · {detail.customer_name}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <IconClose />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Meja
                  </p>
                  <p className="font-bold text-slate-800 text-lg mt-0.5">
                    {detail.table_number || "-"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Pelanggan
                  </p>
                  <p className="font-bold text-slate-800 mt-0.5 truncate">
                    {detail.customer_name}
                  </p>
                </div>
              </div>

              <div
                className={`rounded-xl p-4 ${
                  detail.payment_method === "qris"
                    ? "bg-purple-50 border border-purple-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      detail.payment_method === "qris"
                        ? "bg-purple-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {detail.payment_method === "qris" ? <IconQRIS /> : <IconCash />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      Metode Pembayaran
                    </p>
                    <p className="font-bold text-slate-800">
                      {detail.payment_method === "qris"
                        ? "QRIS (E-Wallet / M-Banking)"
                        : "Cash (Bayar di Kasir)"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Status:{" "}
                      <span className="font-semibold">
                        {detail.payment_status === "paid"
                          ? "Sudah dibayar"
                          : "Belum dibayar"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {detail.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <IconNote /> Catatan
                  </p>
                  <p className="text-sm text-slate-700">{detail.notes}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">
                  Item Pesanan
                </p>
                <div className="space-y-2">
                  {(itemsMap[detail.id] || []).map((it) => (
                    <div
                      key={it.id}
                      className="flex items-start justify-between gap-3 text-sm bg-slate-50 rounded-xl p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">
                          {it.menu_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {it.quantity} × {rp(it.price)}
                          {it.variant_temp && ` · ${it.variant_temp}`}
                          {it.variant_sugar && ` · Gula ${it.variant_sugar}`}
                        </p>
                      </div>
                      <p className="font-bold text-slate-800 shrink-0">
                        {rp(it.price * it.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Total</span>
              <span className="text-2xl font-bold text-slate-900">
                {rp(detail.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }
