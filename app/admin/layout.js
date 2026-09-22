"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/* ========== ICON SVG ========== */
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconKitchen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 2v6a3 3 0 0 0 3 3v11" />
    <path d="M9 2v6" />
    <path d="M12 2v6a3 3 0 0 1-3 3" />
    <path d="M18 2c-1.5 3-1.5 6 0 9v11" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);
const IconHistory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconMenuMobile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconBellOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
    <path d="M18 8a6 6 0 0 0-9.33-5" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const MENU = [
  { href: "/admin", label: "Overview", Icon: IconHome },
  { href: "/admin/dapur", label: "Dapur", Icon: IconKitchen },
  { href: "/admin/menu", label: "Kelola Menu", Icon: IconMenu },
  { href: "/admin/meja", label: "Meja & QR", Icon: IconTable },
  { href: "/admin/riwayat", label: "Riwayat", Icon: IconHistory },
];

function playNotificationSound(audioCtx) {
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

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef(null);
  const channelRef = useRef(null);
  const lastOrderIdRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("sound_enabled");
    if (saved !== null) setSoundEnabled(saved === "true");
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
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        window.location.href = "/admin/login";
      } else {
        setUser(data.session.user);
        setReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!ready) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = uniqueId("admin-global");
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new;
          if (lastOrderIdRef.current === order.id) return;
          lastOrderIdRef.current = order.id;

          if (soundEnabled) {
            audioCtxRef.current = playNotificationSound(audioCtxRef.current);
          }

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(`🔔 Pesanan Baru - Meja ${order.table_number}`, {
                body: `${order.customer_name} · Rp ${(order.total || 0).toLocaleString("id-ID")}`,
                icon: "https://cdn.zass.in/3JXTmgsKRM.png",
                tag: "order-" + order.id,
              });
            } catch (e) {}
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [ready, soundEnabled]);

  function toggleSound() {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem("sound_enabled", newVal ? "true" : "false");
    if (newVal) {
      audioCtxRef.current = playNotificationSound(audioCtxRef.current);
    }
  }

  async function requestNotifPermission() {
    if (!("Notification" in window)) return alert("Browser tidak support");
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("✅ Notifikasi aktif", {
        body: "Anda akan menerima notifikasi pesanan baru",
        icon: "https://cdn.zass.in/3JXTmgsKRM.png",
      });
    }
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <>
        <style jsx global>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #0a0304; }
        `}</style>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(239, 68, 68, 0.22), transparent 65%), radial-gradient(ellipse 60% 50% at 85% 100%, rgba(190, 18, 60, 0.18), transparent 60%), #0a0304",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: "3px solid rgba(239, 68, 68, 0.2)",
                borderTopColor: "#ef4444",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                margin: "0 auto 12px",
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
              }}
            />
            <p style={{ color: "#fca5a5", fontSize: 14 }}>Memuat...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </>
    );
  }

  async function handleLogout() {
    if (!confirm("Logout dari dashboard?")) return;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0304; }
        .admin-bg {
          background:
            radial-gradient(ellipse 70% 55% at 50% 0%, rgba(239, 68, 68, 0.22), transparent 65%),
            radial-gradient(ellipse 60% 50% at 85% 100%, rgba(190, 18, 60, 0.18), transparent 60%),
            radial-gradient(ellipse 50% 40% at 10% 90%, rgba(220, 38, 38, 0.14), transparent 60%),
            #0a0304;
          position: relative;
          overflow-x: hidden;
        }
        .admin-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(239, 68, 68, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 65% 65% at 50% 50%, #000 25%, transparent 72%);
          -webkit-mask-image: radial-gradient(ellipse 65% 65% at 50% 50%, #000 25%, transparent 72%);
          pointer-events: none;
          z-index: 0;
        }
        .admin-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          opacity: 0.4;
          z-index: 0;
        }
        .admin-orb-1 {
          width: 420px; height: 420px;
          background: #ef4444;
          top: -140px; left: -140px;
          animation: drift 13s ease-in-out infinite;
        }
        .admin-orb-2 {
          width: 340px; height: 340px;
          background: #dc2626;
          bottom: -120px; right: -120px;
          animation: drift 13s ease-in-out infinite reverse;
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(45px, -35px) scale(1.1); }
        }
        .glass-card {
          background: rgba(20, 6, 8, 0.65);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(239, 68, 68, 0.22);
          box-shadow:
            0 24px 64px rgba(0, 0, 0, 0.5),
            0 0 60px rgba(239, 68, 68, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        .glass-card-light {
          background: rgba(20, 6, 8, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(239, 68, 68, 0.18);
        }
        .text-red-glow {
          text-shadow: 0 0 24px rgba(239, 68, 68, 0.5);
        }
      `}</style>

      <div className="admin-bg min-h-screen flex" style={{ position: "relative" }}>
        <div className="admin-orb admin-orb-1" />
        <div className="admin-orb admin-orb-2" />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
          style={{
            background: "rgba(15, 4, 6, 0.85)",
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)",
            borderRight: "1px solid rgba(239, 68, 68, 0.22)",
            boxShadow: "0 0 60px rgba(239, 68, 68, 0.1)",
          }}
        >
          <div className="p-5 border-b border-red-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
                }}
              >
                W
              </div>
              <div>
                <p className="font-bold text-sm text-red-50">Barokah</p>
                <p className="text-[10px] text-red-300/60 uppercase tracking-wider">
                  Admin Panel
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-red-300/60 hover:text-red-200"
            >
              <IconClose />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {MENU.map(({ href, label, Icon }) => {
              const active =
                pathname === href ||
                (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-white"
                      : "text-red-300/60 hover:text-red-100"
                  }`}
                  style={
                    active
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(239,68,68,0.9), rgba(185,28,28,0.85))",
                          boxShadow: "0 8px 24px rgba(239, 68, 68, 0.35)",
                        }
                      : {}
                  }
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-red-500/20 space-y-2">
            <button
              onClick={toggleSound}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                soundEnabled
                  ? "text-green-300"
                  : "text-red-300/50"
              }`}
              style={
                soundEnabled
                  ? { background: "rgba(34, 197, 94, 0.1)" }
                  : { background: "rgba(255, 255, 255, 0.03)" }
              }
            >
              <div className="flex items-center gap-3">
                {soundEnabled ? <IconBell /> : <IconBellOff />}
                <span>{soundEnabled ? "Suara: ON" : "Suara: OFF"}</span>
              </div>
            </button>

            {"Notification" in window && Notification.permission !== "granted" && (
              <button
                onClick={requestNotifPermission}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-300"
                style={{ background: "rgba(245, 158, 11, 0.1)" }}
              >
                <IconBell />
                <span>Aktifkan Notif</span>
              </button>
            )}

            <div
              className="px-3 py-2 rounded-xl"
              style={{ background: "rgba(255, 255, 255, 0.03)" }}
            >
              <p className="text-[10px] text-red-300/50 uppercase tracking-wider">
                Login sebagai
              </p>
              <p className="text-xs text-red-100 truncate">
                {user?.email || "Admin"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300/60 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <IconLogout />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 lg:ml-64 flex flex-col min-w-0" style={{ position: "relative", zIndex: 1 }}>
          <header
            className="lg:hidden sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
            style={{
              background: "rgba(15, 4, 6, 0.9)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-red-200"
            >
              <IconMenuMobile />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                }}
              >
                W
              </div>
              <span className="font-semibold text-sm text-red-50 truncate">
                Barokah Admin
              </span>
            </div>
            <button
              onClick={toggleSound}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                soundEnabled ? "text-green-300" : "text-red-300/50"
              }`}
              style={
                soundEnabled
                  ? { background: "rgba(34, 197, 94, 0.15)" }
                  : { background: "rgba(255, 255, 255, 0.05)" }
              }
            >
              {soundEnabled ? <IconBell /> : <IconBellOff />}
            </button>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </>
  );
  }
