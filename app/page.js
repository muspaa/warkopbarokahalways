"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

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
    if (!tableNumber.trim()) return alert("Nomor meja harus diisi");
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

  const filteredMenus =
    filter === "all" ? menus : menus.filter((m) => m.category === filter);

  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#f4ede2]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center gap-6 px-4 sm:px-8 py-4 bg-[#0b0a08]/90 backdrop-blur-md border-b border-[#d4a24c]/20">
        <a href="#top" className="text-[#d4a24c] font-bold text-lg tracking-wider">
          🍜 BAROCKAH
        </a>
        <nav className="hidden md:flex gap-6 ml-auto">
          <a href="#menu" className="text-sm text-[#9c948a] hover:text-[#f4ede2] transition-colors">
            Menu
          </a>
        </nav>
        <button
          onClick={() => setCartOpen(true)}
          className="relative ml-auto md:ml-0 flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4a24c]/10 border border-[#d4a24c]/40 text-[#d4a24c] font-bold text-sm hover:bg-[#d4a24c]/20 transition-all"
        >
          🛒 <span className="hidden sm:inline">Keranjang</span>
          {totalQty > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] text-xs font-extrabold flex items-center justify-center">
              {totalQty}
            </span>
          )}
        </button>
      </header>

      <main className="pt-20">
        {/* HERO */}
        <section className="relative min-h-[80vh] flex items-center px-4 sm:px-8 py-16 overflow-hidden">
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
            <h1 className="font-bold text-[clamp(2.6rem,8vw,5rem)] leading-[1.05] mb-5">
              WARKOP
              <br />
              <span className="text-[#d4a24c]">BAROCKAH</span> ALWAYS
            </h1>
            <p className="text-[#9c948a] text-lg mb-8 max-w-md">
              Kopi single origin, makanan lezat, dan suasana nyaman. Pesan langsung, tanpa daftar akun.
            </p>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold px-6 py-3 rounded-full shadow-lg shadow-[#d4a24c]/40 hover:-translate-y-1 transition-transform"
            >
              Lihat Menu →
            </a>
          </div>
        </section>

        {/* MENU */}
        <section id="menu" className="px-4 sm:px-8 py-16 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#d4a24c] uppercase mb-2">
                Menu Pilihan
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold">
                BAROCKAH <span className="text-[#d4a24c]">ALWAYS</span>
              </h2>
            </div>
            <div className="flex gap-2">
              {[
                { k: "all", l: "Semua" },
                { k: "minuman", l: "Minuman" },
                { k: "makanan", l: "Makanan" },
              ].map((f) => (
                <button
                  key={f.k}
                  onClick={() => setFilter(f.k)}
                  className={`px-5 py-2 rounded-full border text-sm font-semibold transition-all ${
                    filter === f.k
                      ? "bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] border-[#d4a24c]"
                      : "border-[#d4a24c]/30 text-[#9c948a] hover:text-[#f4ede2] hover:border-[#d4a24c]"
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          {filteredMenus.length === 0 ? (
            <p className="text-center py-16 text-[#9c948a]">Memuat menu...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenus.map((m) => (
                <article
                  key={m.id}
                  className="group bg-gradient-to-b from-[#d4a24c]/5 to-[#131110] border border-[#d4a24c]/20 rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-[#d4a24c]/50 hover:shadow-2xl hover:shadow-[#d4a24c]/20 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#1a1714]">
                    <img
                      src={m.image_url}
                      alt={m.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <span className="absolute top-3 left-3 bg-[#0b0a08]/85 backdrop-blur px-3 py-1 rounded-full text-[#d4a24c] text-xs font-semibold border border-[#d4a24c]/30">
                      {m.category === "minuman" ? "☕ Minuman" : "🍽 Makanan"}
                    </span>
                    {m.is_favorite && (
                      <span className="absolute top-3 right-3 bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] text-xs font-bold px-2 py-1 rounded">
                        FAVORIT
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-[#9c948a] mb-2">
                      <span className="text-[#d4a24c]">★★★★★</span>
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
                        <p className="text-xs text-[#9c948a] uppercase tracking-wider">
                          Harga
                        </p>
                        <p className="text-[#d4a24c] font-bold text-lg">
                          {rupiah(m.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAdd(m)}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] text-2xl font-bold flex items-center justify-center shadow-lg shadow-[#d4a24c]/40 hover:rotate-90 transition-transform"
                        aria-label={`Tambah ${m.name}`}
                      >
                        +
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
        © {new Date().getFullYear()} Warkop Barockah Always. All rights reserved.
      </footer>

      {/* CART DRAWER */}
      <aside
        className={`fixed top-0 right-0 h-full w-[min(400px,92vw)] bg-[#131110] border-l border-[#d4a24c]/20 z-[200] flex flex-col transition-transform duration-500 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#d4a24c]/20">
          <h3 className="font-bold text-lg">Pesananmu</h3>
          <button
            onClick={() => setCartOpen(false)}
            className="text-2xl text-[#9c948a] hover:text-[#d4a24c] transition-colors"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-[#9c948a] mt-12">
              Belum ada pesanan.
              <br />
              Pilih menu favoritmu dulu.
            </p>
          ) : (
            cart.map((x, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[56px_1fr_auto] gap-3 items-center pb-4 border-b border-[#d4a24c]/20"
              >
                <img
                  src={x.image_url}
                  alt={x.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{x.name}</p>
                  <p className="text-xs text-[#9c948a]">{rupiah(x.price)}</p>
                  {x.variant && (
                    <p className="text-xs text-[#d4a24c] italic">
                      {variantLabel(x.variant)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeQty(idx, -1)}
                    className="w-7 h-7 rounded-full border border-[#d4a24c]/30 text-[#d4a24c] hover:bg-[#d4a24c] hover:text-[#1a1408] transition-all"
                  >
                    −
                  </button>
                  <span className="font-bold w-5 text-center">{x.qty}</span>
                  <button
                    onClick={() => changeQty(idx, 1)}
                    className="w-7 h-7 rounded-full border border-[#d4a24c]/30 text-[#d4a24c] hover:bg-[#d4a24c] hover:text-[#1a1408] transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-6 border-t border-[#d4a24c]/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#9c948a]">Total</span>
            <strong className="text-2xl text-[#d4a24c]">{rupiah(totalPrice)}</strong>
          </div>
          <button
            onClick={() => {
              if (cart.length === 0) return;
              setCartOpen(false);
              setShowCheckout(true);
            }}
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold py-3 rounded-full disabled:opacity-50 hover:shadow-lg transition-all"
          >
            Pesan Sekarang
          </button>
        </div>
      </aside>

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
          <div className="bg-[#131110] border border-[#d4a24c]/30 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#d4a24c]/20 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">Konfirmasi Pesanan</h3>
                <p className="text-[#d4a24c] font-bold">{rupiah(totalPrice)}</p>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-2xl text-[#9c948a] hover:text-[#d4a24c]"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#d4a24c] mb-2">
                  Nama Kamu *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi"
                  className="w-full px-4 py-3 rounded-xl border border-[#d4a24c]/30 bg-transparent text-[#f4ede2] outline-none focus:border-[#d4a24c]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#d4a24c] mb-2">
                  Nomor Meja *
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Contoh: 7"
                  className="w-full px-4 py-3 rounded-xl border border-[#d4a24c]/30 bg-transparent text-[#f4ede2] outline-none focus:border-[#d4a24c]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#d4a24c] mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: jangan pakai pedas"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#d4a24c]/30 bg-transparent text-[#f4ede2] outline-none focus:border-[#d4a24c] resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#d4a24c]/20 flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="px-5 py-3 rounded-full border border-[#d4a24c]/30 text-[#9c948a] font-semibold hover:text-[#f4ede2]"
              >
                Batal
              </button>
              <button
                onClick={submitOrder}
                disabled={submitting}
                className="flex-1 bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold py-3 rounded-full disabled:opacity-60"
              >
                {submitting ? "Mengirim..." : "🚀 Kirim Pesanan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPTION MODAL */}
      {optionModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="bg-[#131110] border border-[#d4a24c]/30 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#d4a24c]/20 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{optionModal.name}</h3>
                <p className="text-[#d4a24c] font-bold">{rupiah(optionModal.price)}</p>
              </div>
              <button
                onClick={() => setOptionModal(null)}
                className="text-2xl text-[#9c948a] hover:text-[#d4a24c]"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#d4a24c] mb-3">
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
                          : "border-[#d4a24c]/30 text-[#9c948a] hover:text-[#f4ede2]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#d4a24c] mb-3">
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
                          : "border-[#d4a24c]/30 text-[#9c948a] hover:text-[#f4ede2]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#d4a24c]/20 flex gap-3">
              <button
                onClick={() => setOptionModal(null)}
                className="px-5 py-3 rounded-full border border-[#d4a24c]/30 text-[#9c948a] font-semibold hover:text-[#f4ede2]"
              >
                Batal
              </button>
              <button
                onClick={confirmOption}
                className="flex-1 bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold py-3 rounded-full"
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
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2">Pesanan Terkirim!</h3>
            <p className="text-[#9c948a] mb-4">Pesananmu sedang diproses dapur.</p>
            <p className="text-[#d4a24c] font-bold text-lg mb-6">
              Meja {successOrder.table_number} · {rupiah(successOrder.total)}
            </p>
            <button
              onClick={() => setSuccessOrder(null)}
              className="w-full bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold py-3 rounded-full"
            >
              Pesan Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
