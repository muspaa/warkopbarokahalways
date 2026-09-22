"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconCash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);
const IconQRIS = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

function playSound(audioCtx) {
  try {
    const ctx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;

    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.connect(g1);
    g1.connect(ctx.destination);
    o1.type = "sine";
    o1.frequency.setValueAtTime(880, now);
    g1.gain.setValueAtTime(0, now);
    g1.gain.linearRampToValueAtTime(0.4, now + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    o1.start(now);
    o1.stop(now + 0.3);

    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.connect(g2);
    g2.connect(ctx.destination);
    o2.type = "sine";
    o2.frequency.setValueAtTime(660, now + 0.2);
    g2.gain.setValueAtTime(0, now + 0.2);
    g2.gain.linearRampToValueAtTime(0.4, now + 0.22);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    o2.start(now + 0.2);
    o2.stop(now + 0.6);

    const o3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    o3.connect(g3);
    g3.connect(ctx.destination);
    o3.type = "sine";
    o3.frequency.setValueAtTime(1100, now + 0.45);
    g3.gain.setValueAtTime(0, now + 0.45);
    g3.gain.linearRampToValueAtTime(0.35, now + 0.47);
    g3.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    o3.start(now + 0.45);
    o3.stop(now + 0.9);
    return ctx;
  } catch (e) {
    return null;
  }
}

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function DapurPage() {
  const [orders, setOrders] = useState([]);
  const [itemsMap, setItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [detail, setDetail] = useState(null);
  const [popup, setPopup] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());

  const audioCtxRef = useRef(null);
  const channelRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    const saved = localStorage.getItem("sound_enabled");
    if (saved !== null) setSoundEnabled(saved === "true");
    function onStorage(e) {
      if (e.key === "sound_enabled") setSoundEnabled(e.newValue === "true");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    function unlock() {
      if (audioCtxRef.current) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctx.resume().then(() => {
          audioCtxRef.current = ctx;
        });
      } catch (e) {}
    }
    unlock();
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  useEffect(() => {
    isFirstLoadRef.current = true;
    seenIdsRef.current = new Set();
    loadOrders(true);

    const tick = setInterval(() => setNow(Date.now()), 10000);
    const pollInterval = setInterval(() => loadOrders(false), 3000);

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = uniqueId("dapur");
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const order = payload.new;
            if (seenIdsRef.current.has(order.id)) return;
            seenIdsRef.current.add(order.id);

            if (!isFirstLoadRef.current) {
              if (soundEnabled) {
                audioCtxRef.current = playSound(audioCtxRef.current);
              }
              setPopup(order);
              setTimeout(() => setPopup(null), 5000);
            }
          }
          loadOrders(false);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      clearInterval(tick);
      clearInterval(pollInterval);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [soundEnabled]);

  async function loadOrders(isFirst) {
    try {
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
      setLastSync(new Date());

      if (isFirst) {
        (ordersData || []).forEach((o) => seenIdsRef.current.add(o.id));
        setTimeout(() => {
          isFirstLoadRef.current = false;
        }, 2000);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  async function acceptOrder(id) {
    await supabase.from("orders").update({ status: "diterima" }).eq("id", id);
    loadOrders(false);
  }

  async function rejectOrder(id) {
    if (!confirm("Tolak pesanan ini?")) return;
    await supabase.from("orders").update({ status: "ditolak" }).eq("id", id);
    loadOrders(false);
  }

  function manualRefresh() {
    loadOrders(false);
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

  const timeStr = lastSync.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {popup && (
        <div
          className="fixed top-4 right-4 z-[100] rounded-2xl p-5 max-w-sm"
          style={{
            background: "linear-gradient(135deg, #ef4444, #b91c1c)",
            boxShadow: "0 24px 64px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.3)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
              <IconBell />
            </div>
            <div className="flex-1 min-w-0 text-white">
              <p className="font-bold text-base">🔔 Pesanan Baru!</p>
              <p className="text-sm text-white/90 truncate">
                Meja {popup.table_number} · {popup.customer_name}
              </p>
              <p className="text-lg font-bold mt-1">{rp(popup.total)}</p>
            </div>
            <button
              onClick={() => setPopup(null)}
              className="text-white/80 hover:text-white shrink-0"
            >
              <IconClose />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-red-50 text-red-glow">
            Layar Dapur
          </h1>
          <p className="text-red-300/60 mt-1 text-sm">
            Terima atau tolak pesanan · Sync: {timeStr}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={manualRefresh}
            className="glass-card rounded-xl px-4 py-3 flex items-center gap-2 hover:border-red-500/50 transition-colors text-red-100"
          >
            <IconRefresh />
            <span className="text-sm font-semibold">Refresh</span>
          </button>
          <div className="glass-card rounded-xl px-5 py-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)",
              }}
            >
              <IconInbox />
            </div>
            <div>
              <p className="text-[10px] text-red-300/60 uppercase tracking-wider font-semibold">
                Pesanan Baru
              </p>
              <p className="text-2xl font-bold text-red-50 leading-none">
                {orders.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-2xl text-center py-20 border-dashed">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{
              background: "linear-gradient(135deg, #22c55e, #10b981)",
              boxShadow: "0 8px 24px rgba(34, 197, 94, 0.4)",
            }}
          >
            <IconCheck />
          </div>
          <p className="text-lg font-bold text-red-50">Tidak ada pesanan baru</p>
          <p className="text-red-300/60 text-sm mt-1">
            Pesanan masuk akan muncul otomatis · Auto sync tiap 3 detik
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => {
            const urgent = isUrgent(o.created_at);
            const items = itemsMap[o.id] || [];
            const isQris = o.payment_method === "qris";

            return (
              <div
                key={o.id}
                className={`rounded-2xl p-4 transition-all flex flex-col ${
                  urgent ? "border-red-400" : ""
                }`}
                style={{
                  background: urgent
                    ? "rgba(239, 68, 68, 0.15)"
                    : "rgba(20, 6, 8, 0.65)",
                  backdropFilter: "blur(20px) saturate(150%)",
                  WebkitBackdropFilter: "blur(20px) saturate(150%)",
                  border: urgent
                    ? "2px solid rgba(239, 68, 68, 0.6)"
                    : "1px solid rgba(239, 68, 68, 0.22)",
                  boxShadow: urgent
                    ? "0 0 40px rgba(239, 68, 68, 0.3)"
                    : "0 24px 64px rgba(0, 0, 0, 0.4)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 text-white"
                      style={{
                        background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                        boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
                      }}
                    >
                      {o.table_number || "?"}
                    </div>
                    <div>
                      <p className="text-[10px] text-red-300/60 uppercase tracking-wider font-bold">
                        Meja
                      </p>
                      <p className="font-bold text-red-50 text-base truncate max-w-[100px]">
                        {o.customer_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="inline-block text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider text-white"
                      style={{
                        background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                      }}
                    >
                      Baru
                    </span>
                    <p
                      className={`text-xs mt-1.5 font-semibold flex items-center justify-end gap-1 ${
                        urgent ? "text-red-300" : "text-red-300/60"
                      }`}
                    >
                      <IconClock /> {elapsed(o.created_at)}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-bold"
                  style={
                    isQris
                      ? {
                          background: "rgba(168, 85, 247, 0.15)",
                          border: "1px solid rgba(168, 85, 247, 0.3)",
                          color: "#c4b5fd",
                        }
                      : {
                          background: "rgba(34, 197, 94, 0.15)",
                          border: "1px solid rgba(34, 197, 94, 0.3)",
                          color: "#86efac",
                        }
                  }
                >
                  {isQris ? <IconQRIS /> : <IconCash />}
                  <span>{isQris ? "QRIS" : "CASH"}</span>
                </div>

                <div
                  className="rounded-xl p-3 mb-3 space-y-1.5 max-h-32 overflow-y-auto"
                  style={{ background: "rgba(255, 255, 255, 0.03)" }}
                >
                  {items.slice(0, 4).map((it) => (
                    <div key={it.id} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white"
                        style={{ background: "#ef4444" }}
                      >
                        {it.quantity}
                      </span>
                      <span className="font-medium text-red-100 truncate">
                        {it.menu_name}
                      </span>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <p className="text-[11px] text-red-300/50 italic">
                      +{items.length - 4} item lainnya
                    </p>
                  )}
                </div>

                {o.notes && (
                  <div
                    className="flex items-start gap-2 rounded-lg p-2 mb-3 text-xs"
                    style={{
                      background: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      color: "#fcd34d",
                    }}
                  >
                    <IconNote />
                    <span className="flex-1 line-clamp-2">{o.notes}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3 pt-2 border-t border-red-500/15">
                  <span className="text-xs text-red-300/60 font-semibold">Total</span>
                  <span className="font-bold text-red-50 text-lg">
                    {rp(o.total)}
                  </span>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => rejectOrder(o.id)}
                      className="py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      style={{
                        background: "rgba(20, 6, 8, 0.5)",
                        border: "2px solid rgba(239, 68, 68, 0.5)",
                        color: "#fca5a5",
                      }}
                    >
                      <IconX /> Tolak
                    </button>
                    <button
                      onClick={() => acceptOrder(o.id)}
                      className="py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      style={{
                        background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                        boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
                      }}
                    >
                      <IconCheck /> Terima
                    </button>
                  </div>

                  <button
                    onClick={() => setDetail(o)}
                    className="w-full py-2 rounded-xl font-semibold text-xs transition-colors"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fca5a5",
                    }}
                  >
                    Lihat Detail Lengkap
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDetail(null)}
          />
          <div
            className="relative rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col"
            style={{
              background: "rgba(20, 6, 8, 0.95)",
              backdropFilter: "blur(24px) saturate(150%)",
              WebkitBackdropFilter: "blur(24px) saturate(150%)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8), 0 0 60px rgba(239, 68, 68, 0.2)",
            }}
          >
            <div className="p-5 border-b border-red-500/20 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-red-50">Detail Pesanan</h3>
                <p className="text-xs text-red-300/60 mt-0.5">
                  Meja {detail.table_number} · {detail.customer_name}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-red-300/60 hover:text-red-100"
                style={{ background: "rgba(255, 255, 255, 0.05)" }}
              >
                <IconClose />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-3"
                  style={{ background: "rgba(255, 255, 255, 0.03)" }}
                >
                  <p className="text-[10px] text-red-300/60 uppercase tracking-wider font-bold">
                    Meja
                  </p>
                  <p className="font-bold text-red-50 text-lg mt-0.5">
                    {detail.table_number || "-"}
                  </p>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{ background: "rgba(255, 255, 255, 0.03)" }}
                >
                  <p className="text-[10px] text-red-300/60 uppercase tracking-wider font-bold">
                    Pelanggan
                  </p>
                  <p className="font-bold text-red-50 mt-0.5 truncate">
                    {detail.customer_name}
                  </p>
                </div>
              </div>

              <div
                className="rounded-xl p-4"
                style={
                  detail.payment_method === "qris"
                    ? {
                        background: "rgba(168, 85, 247, 0.15)",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                      }
                    : {
                        background: "rgba(34, 197, 94, 0.15)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                      }
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{
                      background:
                        detail.payment_method === "qris"
                          ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                          : "linear-gradient(135deg, #22c55e, #10b981)",
                    }}
                  >
                    {detail.payment_method === "qris" ? <IconQRIS /> : <IconCash />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-red-300/60 uppercase tracking-wider font-bold">
                      Metode Pembayaran
                    </p>
                    <p className="font-bold text-red-50">
                      {detail.payment_method === "qris"
                        ? "QRIS"
                        : "Cash (Bayar di Kasir)"}
                    </p>
                  </div>
                </div>
              </div>

              {detail.notes && (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1 font-bold" style={{ color: "#fcd34d" }}>
                    <IconNote /> Catatan
                  </p>
                  <p className="text-sm text-red-100">{detail.notes}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] text-red-300/60 uppercase tracking-wider font-bold mb-2">
                  Item Pesanan
                </p>
                <div className="space-y-2">
                  {(itemsMap[detail.id] || []).map((it) => (
                    <div
                      key={it.id}
                      className="flex items-start justify-between gap-3 text-sm rounded-xl p-3"
                      style={{ background: "rgba(255, 255, 255, 0.03)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-red-50">{it.menu_name}</p>
                        <p className="text-xs text-red-300/60 mt-0.5">
                          {it.quantity} × {rp(it.price)}
                          {it.variant_temp && ` · ${it.variant_temp}`}
                          {it.variant_sugar && ` · Gula ${it.variant_sugar}`}
                        </p>
                      </div>
                      <p className="font-bold text-red-50 shrink-0">
                        {rp(it.price * it.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-red-500/20 flex items-center justify-between">
              <span className="text-red-300/60 font-semibold">Total</span>
              <span className="text-2xl font-bold text-red-50">
                {rp(detail.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }
