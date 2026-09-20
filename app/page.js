"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/* ========== ICON SVG ========== */
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconCoffee = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);
const IconFood = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
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
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function HomePage() {
  const [menus, setMenus] = useState([]);
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [optionModal, setOptionModal] = useState(null);
  const [selectedTemp, setSelectedTemp] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);
  const [search, setSearch] = useState("");

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
  }

  function changeQty(idx, d) {
    setCart((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + d };
      if (next[idx].qty <= 0) next.splice(idx, 1);
      return next;
    });
  }

  function handleAdd(item) {
    if (item.category === "minuman") {
      setOptionModal(item);
      setSelectedTemp(null);
      setSelectedSugar(null);
    } else {
      addToCart(item);
    }
  }

  function confirmOption() {
    if (!selectedTemp || !selectedSugar) {
      alert("Pilih suhu dan gula dulu");
      return;
    }
    addToCart(optionModal, { temp: selectedTemp, sugar: selectedSugar });
    setOptionModal(null);
  }

  const totalQty = cart.reduce((s, x) => s + x.qty, 0);
  const totalPrice = cart.reduce((s, x) => s + x.price * x.qty, 0);

  function variantLabel(v) {
    if (!v) return "";
    return `${v.temp} · Gula ${v.sugar}`;
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
        menu_name: x.name,
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

  const filteredMenus = menus.filter((m) => {
    const matchFilter = filter === "all" || m.category === filter;
    const matchSearch = !search.trim() || m.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#f4ede2]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center gap-4 px-4 sm:px-8 py-4 bg-[#0b0a08]/90 backdrop-blur-md border-b border-[#d4a24c]/20">
        <a href="#top" className="flex items-center gap-2 text-[#d4a24c] font-bold text-lg tracking-wider shrink-0">
          <IconCoffee />
          <span className="hidden sm:inline">BAROCKAH</span>
        </a>

        {tableNumber && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
            <IconMapPin />
            Meja {tableNumber}
          </div>
        )}

        <nav className="hidden md:flex gap-6 ml-auto">
          <a href="#menu" className="text-sm text-[#9c948a] hover:text-[#f4ede2] transition-colors">
            Menu
          </a>
        </nav>

        <button
          onClick={() => setCartOpen(true)}
          className="relative ml-auto md:ml-0 flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4a24c]/10 border border-[#d4a24c]/40 text-[#d4a24c] font-bold text-sm hover:bg-[#d4a24c]/20 transition-all"
        >
          <IconCart />
          <span className="hidden sm:inline">Keranjang</span>
          {totalQty > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] text-xs font-extrabold flex items-center justify-center">
              {totalQty}
            </span>
          )}
        </button>
      </header>

      <main className="pt-20">
        {/* Banner meja */}
        {tableNumber && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2">
            <IconMapPin />
            Anda di Meja {tableNumber} · Pesanan akan diantar ke meja ini
          </div>
        )}

        {/* HERO */}
        <section className="relative min-h-[60vh] flex items-center px-4 sm:px-8 py-16 overflow-hidden">
          <div
            className="absolute inset-0 opacity-25 bg-cover bg-center"
            style={{
              backgroundImage:
                "radial-gradient(circle at 75% 30%, rgba(212,162,76,0.16), transparent 55%), radial-gradient(circle at 15% 80%, rgba(212,162,76,0.08), transparent 50%), url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=70')",
            }}
          />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs tracking-[0.3em] text-[#d4a24c] uppercase mb-3">
              Ngopi · Makan · Santai
            </p>
            <h1 className="font-bold text-[clamp(2.4rem,7vw,4.5rem)] leading-[1.05] mb-5">
              WARKOP
              <br />
              <span className="text-[#d4a24c]">BAROCKAH</span> ALWAYS
            </h1>
            <p className="text-[#9c948a] text-base sm:text-lg mb-8 max-w-md">
              Kopi single origin, makanan lezat, dan suasana nyaman. Pesan langsung, tanpa daftar akun.
            </p>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold px-6 py-3 rounded-full shadow-lg shadow-[#d4a24c]/40 hover:-translate-y-1 transition-transform"
            >
              Lihat Menu <IconArrowRight />
            </a>
          </div>
        </section>

        {/* MENU */}
        <section id="menu" className="px-4 sm:px-8 py-12 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#d4a24c] uppercase mb-2">
                Menu Pilihan
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold">
                BAROCKAH <span className="text-[#d4a24c]">ALWAYS</span>
              </h2>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-5">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#9c948a] pointer-events-none">
              <IconSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-[#d4a24c]/20 text-[#f4ede2] placeholder-[#9c948a] outline-none focus:border-[#d4a24c] focus:ring-2 focus:ring-[#d4a24c]/20 transition-all"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { k: "all", l: "Semua" },
              { k: "minuman", l: "Minuman" },
              { k: "makanan", l: "Makanan" },
            ].map((f) => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`px-5 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === f.k
                    ? "bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] border-[#d4a24c]"
                    : "border-[#d4a24c]/30 text-[#9c948a] hover:text-[#f4ede2] hover:border-[#d4a24c]"
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filteredMenus.length === 0 ? (
            <p className="text-center py-16 text-[#9c948a]">Menu tidak ditemukan</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMenus.map((m) => (
                <article
                  key={m.id}
                  className="group bg-gradient-to-b from-[#d4a24c]/5 to-[#131110] border border-[#d4a24c]/20 rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-[#d4a24c]/50 hover:shadow-2xl hover:shadow-[#d4a24c]/20 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#1a1714]">
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
                    <span className="absolute top-3 left-3 bg-[#0b0a08]/85 backdrop-blur px-3 py-1.5 rounded-full text-[#d4a24c] text-xs font-semibold border border-[#d4a24c]/30 flex items-center gap-1.5">
                      {m.category === "minuman" ? <IconCoffee /> : <IconFood />}
                      {m.category === "minuman" ? "Minuman" : "Makanan"}
                    </span>
                    {m.is_favorite && (
                      <span className="absolute top-3 right-3 bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wider">
                        FAVORIT
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-[#9c948a] mb-2">
                      <div className="flex text-[#d4a24c] gap-0.5">
                        {Array(5).fill(0).map((_, i) => <IconStar key={i} />)}
                      </div>
                      <span>{Number(m.rating || 4.7).toFixed(1)}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#e8bd6e] transition-colors">
                      {m.name}
                    </h3>
                    <p className="text-sm text-[#9c948a] line-clamp-2 flex-1 mb-4">
                      {m.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-[#d4a24c]/20">
                      <div>
                        <p className="text-[10px] text-[#9c948a] uppercase tracking-wider font-bold">
                          Harga
                        </p>
                        <p className="text-[#d4a24c] font-bold text-lg">
                          {rupiah(m.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAdd(m)}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] flex items-center justify-center shadow-lg shadow-[#d4a24c]/40 hover:rotate-90 hover:scale-110 transition-transform active:scale-95"
                        aria-label={`Tambah ${m.name}`}
                      >
                        <IconPlus />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="px-4 sm:px-8 py-8 border-t border-[#d4a24c]/20 text-center text-sm text-[#9c948a]">
        © {new Date().getFullYear()} Warkop Barockah Always
      </footer>

      {/* CART DRAWER */}
      <aside
        className={`fixed top-0 right-0 h-full w-[min(400px,92vw)] bg-[#131110] border-l border-[#d4a24c]/20 z-[200] flex flex-col transition-transform duration-500 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#d4a24c]/20">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <IconCart /> Pesananmu
          </h3>
          <button
            onClick={() => setCartOpen(false)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-[#9c948a] hover:text-[#d4a24c] transition-colors flex items-center justify-center"
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
                className="grid grid-cols-[56px_1fr_auto] gap-3 items-center pb-3 border-b border-[#d4a24c]/20"
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
                    <p className="text-[11px] text-[#d4a24c] italic mt-0.5">
                      {variantLabel(x.variant)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeQty(idx, -1)}
                    className="w-7 h-7 rounded-full border border-[#d4a24c]/30 text-[#d4a24c] hover:bg-[#d4a24c] hover:text-[#1a1408] transition-all flex items-center justify-center"
                  >
                    <IconMinus />
                  </button>
                  <span className="font-bold w-5 text-center text-sm">{x.qty}</span>
                  <button
                    onClick={() => changeQty(idx, 1)}
                    className="w-7 h-7 rounded-full border border-[#d4a24c]/30 text-[#d4a24c] hover:bg-[#d4a24c] hover:text-[#1a1408] transition-all flex items-center justify-center"
                  >
                    <IconPlus />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-[#d4a24c]/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#9c948a] text-sm">Total</span>
            <strong className="text-2xl text-[#d4a24c]">{rupiah(totalPrice)}</strong>
          </div>
          <button
            onClick={() => {
              if (cart.length === 0) return;
              setCartOpen(false);
              setShowCheckout(true);
            }}
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold py-3 rounded-full disabled:opacity-50 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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

      {/* CHECKOUT MODAL — TANPA INPUT MEJA */}
      {showCheckout && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="bg-[#131110] border border-[#d4a24c]/30 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-[#d4a24c]/20 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">Konfirmasi Pesanan</h3>
                <p className="text-[#d4a24c] font-bold text-sm mt-0.5">{rupiah(totalPrice)}</p>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#9c948a] hover:text-white transition-colors flex items-center justify-center"
              >
                <IconClose />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Info Meja — readonly */}
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
                <label className="block text-[10px] uppercase tracking-widest text-[#d4a24c] font-bold mb-2">
                  Nama Kamu *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi"
                  className="w-full px-4 py-3 rounded-xl border border-[#d4a24c]/30 bg-transparent text-[#f4ede2] placeholder-[#9c948a] outline-none focus:border-[#d4a24c] focus:ring-2 focus:ring-[#d4a24c]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#d4a24c] font-bold mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: jangan pakai pedas"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#d4a24c]/30 bg-transparent text-[#f4ede2] placeholder-[#9c948a] outline-none focus:border-[#d4a24c] focus:ring-2 focus:ring-[#d4a24c]/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[#d4a24c]/20 flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="px-5 py-3 rounded-full border border-[#d4a24c]/30 text-[#9c948a] font-semibold hover:text-[#f4ede2] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitOrder}
                disabled={submitting || !tableNumber}
                className="flex-1 bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold py-3 rounded-full disabled:opacity-50 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1a1408]/30 border-t-[#1a1408] rounded-full animate-spin" />
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
          <div className="bg-[#131110] border border-[#d4a24c]/30 rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-[#d4a24c]/20 flex justify-between items-start">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#d4a24c]/10 text-[#d4a24c] flex items-center justify-center shrink-0">
                  <IconCoffee />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">{optionModal.name}</h3>
                  <p className="text-[#d4a24c] font-bold text-sm">{rupiah(optionModal.price)}</p>
                </div>
              </div>
              <button
                onClick={() => setOptionModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#9c948a] hover:text-white transition-colors flex items-center justify-center shrink-0"
              >
                <IconClose />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#d4a24c] font-bold mb-3">
                  Pilih Suhu
                </p>
                <div className="flex gap-2">
                  {["Ice", "Hangat", "Panas"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTemp(t)}
                      className={`flex-1 py-3 rounded-full border text-sm font-semibold transition-all ${
                        selectedTemp === t
                          ? "bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] border-[#d4a24c]"
                          : "border-[#d4a24c]/30 text-[#9c948a] hover:text-[#f4ede2] hover:border-[#d4a24c]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#d4a24c] font-bold mb-3">
                  Pilih Gula
                </p>
                <div className="flex gap-2">
                  {["Manis", "Biasa", "Pahit"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSugar(s)}
                      className={`flex-1 py-3 rounded-full border text-sm font-semibold transition-all ${
                        selectedSugar === s
                          ? "bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] border-[#d4a24c]"
                          : "border-[#d4a24c]/30 text-[#9c948a] hover:text-[#f4ede2] hover:border-[#d4a24c]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-[#d4a24c]/20 flex gap-3">
              <button
                onClick={() => setOptionModal(null)}
                className="px-5 py-3 rounded-full border border-[#d4a24c]/30 text-[#9c948a] font-semibold hover:text-[#f4ede2] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmOption}
                className="flex-1 bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold py-3 rounded-full hover:shadow-lg transition-all active:scale-[0.98]"
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
          <div className="bg-[#131110] border border-[#d4a24c]/30 rounded-2xl w-full max-w-sm p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mx-auto flex items-center justify-center text-white mb-5 shadow-lg shadow-green-500/30">
              <IconCheck />
            </div>
            <h3 className="text-2xl font-bold mb-2">Pesanan Terkirim!</h3>
            <p className="text-[#9c948a] mb-4 text-sm">
              Pesananmu sedang diproses dapur.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#d4a24c]/10 border border-[#d4a24c]/30 rounded-full px-4 py-2 mb-6">
              <IconMapPin />
              <span className="text-[#d4a24c] font-bold text-sm">
                Meja {successOrder.table_number}
              </span>
              <span className="text-[#d4a24c]/50">·</span>
              <span className="text-[#d4a24c] font-bold text-sm">
                {rupiah(successOrder.total)}
              </span>
            </div>
            <button
              onClick={() => setSuccessOrder(null)}
              className="w-full bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold py-3 rounded-full hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Pesan Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
  }
