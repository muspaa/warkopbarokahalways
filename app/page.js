"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/* ========== ICON SVG ========== */
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconCoffee = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
  </svg>
);
const IconFood = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconMinus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ========== REVEAL ON SCROLL ========== */
function useRevealOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }) {
  const { ref, visible } = useRevealOnScroll();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const [menus, setMenus] = useState([]);
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [optionModal, setOptionModal] = useState(null);
  const [selectedTemp, setSelectedTemp] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: true });
      setMenus(data || []);
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const meja = params.get("meja");
    if (meja) setTableNumber(meja);
  }, []);

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(null), 1800);
  }

  const rupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  function addToCart(item, variant = null) {
    setCart((prev) => {
      const idx = prev.findIndex(
        (x) =>
          x.id === item.id &&
          JSON.stringify(x.variant || null) === JSON.stringify(variant || null)
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { ...item, qty: 1, variant }];
    });
    showToast(`${item.name} ditambahkan!`);
  }

  function changeQty(idx, d) {
    setCart((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + d };
      if (next[idx].qty <= 0) next.splice(idx, 1);
      return next;
    });
  }

  function getMenuModalType(item) {
    const variants = Array.isArray(item.variants) ? item.variants : [];
    const hasVariant = item.has_variants && variants.length > 0;
    const isMinuman = item.category === "minuman";
    if (hasVariant) return "variant";
    if (isMinuman) return "normal";
    return "none";
  }

  function handleAdd(item) {
    const type = getMenuModalType(item);
    if (type === "variant") {
      setOptionModal({ ...item, modalType: "variant" });
      setSelectedVariant(null);
      setSelectedTemp(null);
      setSelectedSugar(null);
    } else if (type === "normal") {
      setOptionModal({ ...item, modalType: "normal" });
      setSelectedTemp(null);
      setSelectedSugar(null);
      setSelectedVariant(null);
    } else {
      addToCart(item);
    }
  }

  function confirmOption() {
    if (optionModal.modalType === "variant") {
      if (!selectedVariant) {
        alert("Pilih rasa dulu");
        return;
      }
      addToCart(optionModal, { variant: selectedVariant });
      setOptionModal(null);
      return;
    }
    if (!selectedTemp || !selectedSugar) {
      alert("Pilih suhu dan gula dulu");
      return;
    }
    addToCart(optionModal, {
      temp: selectedTemp,
      sugar: selectedSugar,
    });
    setOptionModal(null);
  }

  const totalQty = cart.reduce((s, x) => s + x.qty, 0);
  const totalPrice = cart.reduce((s, x) => s + x.price * x.qty, 0);

  function variantLabel(v) {
    if (!v) return "";
    const parts = [];
    if (v.variant) parts.push(v.variant);
    if (v.temp) parts.push(v.temp);
    if (v.sugar) parts.push(`Gula ${v.sugar}`);
    return parts.join(" · ");
  }

  async function submitOrder() {
    if (!customerName.trim()) return alert("Nama harus diisi");
    if (!tableNumber.trim()) {
      return alert(
        "Nomor meja tidak terdeteksi.\n\nSilakan scan QR code yang ada di meja Anda untuk memesan."
      );
    }
    if (cart.length === 0) return alert("Keranjang kosong");

    setSubmitting(true);
    try {
      const { data: order, error: e1 } = await supabase
        .from("orders")
        .insert({
          customer_name: customerName.trim(),
          table_number: tableNumber.trim(),
          notes: notes.trim() || null,
          total: totalPrice,
          status: "pending",
          is_read: false,
        })
        .select()
        .single();
      if (e1) throw e1;

      const items = cart.map((x) => ({
        order_id: order.id,
        menu_item_id: x.id,
        menu_name: x.variant?.variant
          ? `${x.name} (${x.variant.variant})`
          : x.name,
        price: x.price,
        quantity: x.qty,
        variant_temp: x.variant?.temp || null,
        variant_sugar: x.variant?.sugar || null,
      }));
      const { error: e2 } = await supabase.from("order_items").insert(items);
      if (e2) throw e2;

      setSuccessOrder(order);
      setCart([]);
      setNotes("");
      setCustomerName("");
      setShowCheckout(false);
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredMenus =
    filter === "all" ? menus : menus.filter((m) => m.category === filter);

  const FILTERS = [
    { k: "all", l: "Semua" },
    { k: "makanan", l: "Makanan" },
    { k: "snack", l: "Cemilan" },
    { k: "minuman", l: "Minuman" },
  ];

  const optionVariants = optionModal
    ? Array.isArray(optionModal.variants)
      ? optionModal.variants
      : []
    : [];

  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#f4ede2]">
      <style jsx global>{`
        @keyframes shineSweep {
          0% { left: -100%; }
          60% { left: 120%; }
          100% { left: 120%; }
        }
        .btn-shine {
          position: relative;
          overflow: hidden;
        }
        .btn-shine::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.55) 50%,
            transparent 100%
          );
          transform: skewX(-20deg);
          pointer-events: none;
        }
        .btn-shine:hover::before {
          animation: shineSweep 0.9s ease-out;
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .menu-card-enter {
          animation: cardEnter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes toastIn {
          from { transform: translate(-50%, 80px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .toast-anim {
          animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center gap-4 px-4 sm:px-8 py-3 bg-[#0b0a08]/90 backdrop-blur-md border-b border-white/20">
        <a href="#top" className="flex items-center shrink-0">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-wider leading-tight">
            WARKOP BAROKAH ALWAYS
          </h1>
        </a>

        {tableNumber && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
            <IconMapPin />
            Meja {tableNumber}
          </div>
        )}

        <button
          onClick={() => setCartOpen(true)}
          className="relative ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/40 text-white font-bold text-sm hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
        >
          <IconCart />
          <span className="hidden sm:inline">Keranjang</span>
          {totalQty > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-white text-black text-xs font-extrabold flex items-center justify-center">
              {totalQty}
            </span>
          )}
        </button>
      </header>

      <main className="pt-20">
        {/* HERO — tanpa tombol Menu */}
        <section className="relative min-h-[55vh] flex flex-col justify-end px-4 sm:px-8 pt-16 pb-12 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://cdn.zass.in/CuNIgTQq4a.png')",
            }}
          />
        </section>

        {/* MENU */}
        <section id="menu" className="px-3 sm:px-8 py-10 max-w-6xl mx-auto">
          <Reveal className="mb-6">
            <div className="flex flex-col gap-4 pb-4 border-b border-white/20 relative">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-white uppercase mb-1 font-bold">
                  MENU MAKANAN
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  BAROKAH ALWAYS
                </h2>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:justify-start">
                {FILTERS.map(({ k, l }) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`btn-shine flex-1 sm:flex-initial inline-flex items-center justify-center px-3 sm:px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${
                      filter === k
                        ? "bg-white text-black shadow-lg shadow-white/30"
                        : "bg-[#1a1714] text-[#9c948a] hover:text-white hover:bg-[#241f1a]"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {filteredMenus.length === 0 ? (
            <p className="text-center py-16 text-[#9c948a]">Menu tidak ditemukan</p>
          ) : (
            <div key={filter} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredMenus.map((m, idx) => (
                <Reveal key={m.id} delay={idx * 0.05}>
                  <article className="menu-card-enter group bg-gradient-to-b from-white/5 to-[#131110] border border-white/20 rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:border-white/50 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 flex flex-col h-full">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1714]">
                      {m.image_url ? (
                        <img
                          src={m.image_url}
                          alt={m.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9c948a]">
                          <IconFood />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131110] via-transparent to-transparent pointer-events-none" />

                      {m.is_favorite && (
                        <span className="absolute top-2 right-2 bg-white text-black text-[9px] font-extrabold px-2 py-1 rounded-md tracking-wider uppercase">
                          Favorit
                        </span>
                      )}
                    </div>

                    {/* Nama + garis + harga — TANPA JARAK */}
                    <div className="px-3 sm:px-4 pt-3 pb-3 flex flex-col flex-1 -mt-6 relative z-10">
                      <h3 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-2 mb-0">
                        {m.name}
                      </h3>
                      <div className="flex items-center justify-between pt-1 mt-0 border-t border-white/15">
                        <p className="text-white font-bold text-sm sm:text-base">
                          {rupiah(m.price)}
                        </p>
                        <button
                          onClick={() => handleAdd(m)}
                          className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:rotate-90 hover:scale-110 active:scale-95 transition-all duration-300"
                          aria-label={`Tambah ${m.name}`}
                        >
                          <IconPlus />
                        </button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="px-4 sm:px-8 py-8 border-t border-white/20 text-center text-sm text-[#9c948a]">
        © {new Date().getFullYear()} Warkop Barokah Always
      </footer>

      {toast && (
        <div className="toast-anim fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black font-semibold text-sm px-5 py-3 rounded-full shadow-2xl shadow-white/50 z-[400] flex items-center gap-2">
          <IconCheck />
          {toast}
        </div>
      )}

      {/* CART DRAWER */}
      <aside
        className={`fixed top-0 right-0 h-full w-[min(400px,92vw)] bg-[#131110] border-l border-white/20 z-[200] flex flex-col transition-transform duration-500 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/20">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <IconCart /> Pesananmu
          </h3>
          <button
            onClick={() => setCartOpen(false)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-[#9c948a] hover:text-white hover:rotate-90 hover:scale-110 transition-all flex items-center justify-center"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center mt-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-[#9c948a]">
                <IconCart />
              </div>
              <p className="text-[#9c948a] text-sm">
                Belum ada pesanan.
                <br />
                Pilih menu favoritmu dulu.
              </p>
            </div>
          ) : (
            cart.map((x, idx) => (
              <div
                key={idx}
                className="menu-card-enter grid grid-cols-[56px_1fr_auto] gap-3 items-center pb-3 border-b border-white/20"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1a1714] shrink-0">
                  {x.image_url ? (
                    <img src={x.image_url} alt={x.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9c948a]">
                      <IconFood />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{x.name}</p>
                  <p className="text-xs text-[#9c948a]">{rupiah(x.price)}</p>
                  {x.variant && (
                    <p className="text-[11px] text-white italic mt-0.5">
                      {variantLabel(x.variant)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeQty(idx, -1)}
                    className="w-7 h-7 rounded-full border border-white/30 text-white hover:bg-white hover:text-black hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
                  >
                    <IconMinus />
                  </button>
                  <span className="font-bold w-5 text-center text-sm">{x.qty}</span>
                  <button
                    onClick={() => changeQty(idx, 1)}
                    className="w-7 h-7 rounded-full border border-white/30 text-white hover:bg-white hover:text-black hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
                  >
                    <IconPlus />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-white/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#9c948a] text-sm">Total</span>
            <strong className="text-2xl text-white">{rupiah(totalPrice)}</strong>
          </div>
          <button
            onClick={() => {
              if (cart.length === 0) return;
              setCartOpen(false);
              setShowCheckout(true);
            }}
            disabled={cart.length === 0}
            className="w-full bg-white text-black font-bold py-3 rounded-full disabled:opacity-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Pesan Sekarang <IconArrowRight />
          </button>
        </div>
      </aside>

      {/* OVERLAY */}
      {(cartOpen || showCheckout || optionModal || successOrder) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          onClick={() => {
            setCartOpen(false);
            setShowCheckout(false);
          }}
        />
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="menu-card-enter bg-[#131110] border border-white/30 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-white/20 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">Konfirmasi Pesanan</h3>
                <p className="text-white font-bold text-sm mt-0.5">{rupiah(totalPrice)}</p>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#9c948a] hover:text-white hover:rotate-90 hover:scale-110 transition-all flex items-center justify-center"
              >
                <IconClose />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {tableNumber ? (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                    <IconMapPin />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-green-400 uppercase tracking-wider font-bold">
                      Meja Anda
                    </p>
                    <p className="font-bold text-green-300 text-lg leading-tight">
                      Meja {tableNumber}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <IconMapPin />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">
                      Meja belum terdeteksi
                    </p>
                    <p className="text-amber-300 text-sm">
                      Scan QR di meja Anda untuk memesan
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white font-bold mb-2">
                  Nama Kamu *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi"
                  className="w-full px-4 py-3 rounded-xl border border-white/30 bg-transparent text-white placeholder-[#9c948a] outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white font-bold mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: jangan pakai pedas"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-white/30 bg-transparent text-white placeholder-[#9c948a] outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-white/20 flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="px-5 py-3 rounded-full border border-white/30 text-[#9c948a] font-semibold hover:text-white hover:border-white hover:scale-105 active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                onClick={submitOrder}
                disabled={submitting || !tableNumber}
                className="flex-1 bg-white text-black font-bold py-3 rounded-full disabled:opacity-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>Kirim Pesanan</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPTION MODAL */}
      {optionModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="menu-card-enter bg-[#131110] border border-white/30 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-white/20 flex justify-between items-start">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                  <IconCoffee />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">{optionModal.name}</h3>
                  <p className="text-white font-bold text-sm">{rupiah(optionModal.price)}</p>
                </div>
              </div>
              <button
                onClick={() => setOptionModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#9c948a] hover:text-white hover:rotate-90 hover:scale-110 transition-all flex items-center justify-center shrink-0"
              >
                <IconClose />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {optionModal.modalType === "variant" && optionVariants.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white font-bold mb-3">
                    Pilih Rasa
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {optionVariants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                          selectedVariant === v
                            ? "bg-white text-black border-white shadow-lg shadow-white/30"
                            : "border-white/30 text-[#9c948a] hover:text-white hover:border-white"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {optionModal.modalType === "normal" && (
                <>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white font-bold mb-3">
                      Pilih Suhu
                    </p>
                    <div className="flex gap-2">
                      {["Ice", "Hangat", "Panas"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTemp(t)}
                          className={`flex-1 py-3 rounded-full border text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                            selectedTemp === t
                              ? "bg-white text-black border-white shadow-lg shadow-white/30"
                              : "border-white/30 text-[#9c948a] hover:text-white hover:border-white"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white font-bold mb-3">
                      Pilih Gula
                    </p>
                    <div className="flex gap-2">
                      {["Manis", "Biasa", "Pahit"].map((s) => (
                        <button                          key={s}
                          onClick={() => setSelectedSugar(s)}
                          className={`flex-1 py-3 rounded-full border text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                            selectedSugar === s
                              ? "bg-white text-black border-white shadow-lg shadow-white/30"
                              : "border-white/30 text-[#9c948a] hover:text-white hover:border-white"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-white/20 flex gap-3">
              <button
                onClick={() => setOptionModal(null)}
                className="px-5 py-3 rounded-full border border-white/30 text-[#9c948a] font-semibold hover:text-white hover:border-white hover:scale-105 active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmOption}
                className="flex-1 bg-white text-black font-bold py-3 rounded-full hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {successOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="menu-card-enter bg-[#131110] border border-white/30 rounded-2xl w-full max-w-sm p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white mx-auto flex items-center justify-center text-black mb-5 shadow-lg shadow-white/30">
              <IconCheck />
            </div>
            <h3 className="text-2xl font-bold mb-2">Pesanan Terkirim!</h3>
            <p className="text-[#9c948a] mb-4 text-sm">
              Pesananmu sedang diproses dapur.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 rounded-full px-4 py-2 mb-6">
              <IconMapPin />
              <span className="text-white font-bold text-sm">
                Meja {successOrder.table_number}
              </span>
              <span className="text-white/50">·</span>
              <span className="text-white font-bold text-sm">
                {rupiah(successOrder.total)}
              </span>
            </div>
            <button
              onClick={() => setSuccessOrder(null)}
              className="w-full bg-white text-black font-bold py-3 rounded-full hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Pesan Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
  }
