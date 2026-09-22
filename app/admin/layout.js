"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/* ========== ICON SVG ========== */
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconKitchen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 2v6a3 3 0 0 0 3 3v11" />
    <path d="M9 2v6" />
    <path d="M12 2v6a3 3 0 0 1-3 3" />
    <path d="M18 2c-1.5 3-1.5 6 0 9v11" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);
const IconHistory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconBellOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
    <path d="M18 8a6 6 0 0 0-9.33-5" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ========== MENU ========== */
const MENU = [
  { href: "/admin", label: "Overview", Icon: IconHome },
  { href: "/admin/dapur", label: "Dapur", Icon: IconKitchen },
  { href: "/admin/menu", label: "Kelola Menu", Icon: IconMenu },
  { href: "/admin/meja", label: "Meja & QR", Icon: IconTable },
  { href: "/admin/riwayat", label: "Riwayat", Icon: IconHistory },
];

/* ========== FUNGSI SUARA ========== */
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
    console.error("Sound error:", e);
    return null;
  }
}

/* ========== HELPER: ID UNIK ========== */
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

  // ========== LOAD SETTING SUARA ==========
  useEffect(() => {
    const saved = localStorage.getItem("sound_enabled");
    if (saved !== null) setSoundEnabled(saved === "true");
  }, []);

  // ========== UNLOCK AUDIO ==========
  useEffect(() => {
    function unlock() {
      if (audioCtxRef.current) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctx.resume().then(() => {
          audioCtxRef.current = ctx;
          console.log("🔊 Audio siap");
        });
      } catch (e) {
        console.error("Unlock error:", e);
      }
    }
    unlock();
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // ========== LOGIN CHECK ==========
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

  // ========== REALTIME LISTENER ==========
  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!ready) return;

    // Bersihkan channel lama
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = uniqueId("admin-global");
    console.log("📡 Membuat channel:", channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new;

          // Cegah duplikat
          if (lastOrderIdRef.current === order.id) {
            console.log("⚠️ Duplikat, skip:", order.id);
            return;
          }
          lastOrderIdRef.current = order.id;

          console.log("🔔 Pesanan baru:", order.id);

          // Suara
          if (soundEnabled) {
            audioCtxRef.current = playNotificationSound(audioCtxRef.current);
          }

          // Notif browser
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
            } catch (e) {
              console.error("Notif error:", e);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Global status:", status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [ready, soundEnabled]);

  // ========== TOGGLE SUARA ==========
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Memuat...</p>
        </div>
      </div>
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
    <div className="min-h-screen bg-slate-100 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-black text-lg">
              W
            </div>
            <div>
              <p className="font-bold text-sm">Barokah</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Admin Panel
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
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
                    ? "bg-white text-black"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={toggleSound}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              soundEnabled
                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "bg-slate-800/50 text-slate-500 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {soundEnabled ? <IconBell /> : <IconBellOff />}
              <span>{soundEnabled ? "Suara: ON" : "Suara: OFF"}</span>
            </div>
          </button>

          {"Notification" in window && Notification.permission !== "granted" && (
            <button
              onClick={requestNotifPermission}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
            >
              <IconBell />
              <span>Aktifkan Notif</span>
            </button>
          )}

          <div className="px-3 py-2 rounded-xl bg-slate-800/50">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Login sebagai
            </p>
            <p className="text-xs text-slate-300 truncate">
              {user?.email || "Admin"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <IconLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-700"
          >
            <IconMenuMobile />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white text-xs shrink-0">
              W
            </div>
            <span className="font-semibold text-sm text-slate-800 truncate">
              Barokah Admin
            </span>
          </div>
          <button
            onClick={toggleSound}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              soundEnabled
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {soundEnabled ? <IconBell /> : <IconBellOff />}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
  }
