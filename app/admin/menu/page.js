"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const EMPTY = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category: "makanan",
  rating: 4.7,
  is_favorite: false,
  is_available: true,
  has_variants: false,
  variants: [],
};

/* ========== ICON ========== */
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconFood = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </svg>
);
const IconSparkle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
  </svg>
);

export default function MenuPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [variantInput, setVariantInput] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: false });
    setMenus(data || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(EMPTY);
    setEditId(null);
    setVariantInput("");
    setShowForm(true);
  }

  function openEdit(m) {
    setForm({
      name: m.name,
      description: m.description || "",
      price: m.price,
      image_url: m.image_url || "",
      category: m.category || "makanan",
      rating: m.rating || 4.7,
      is_favorite: m.is_favorite || false,
      is_available: m.is_available,
      has_variants: m.has_variants || false,
      variants: Array.isArray(m.variants) ? m.variants : [],
    });
    setEditId(m.id);
    setVariantInput("");
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Nama wajib diisi");
    if (!form.price) return alert("Harga wajib diisi");
    if (form.has_variants && form.variants.length === 0) {
      return alert("Tambahkan minimal 1 varian rasa, atau matikan opsi varian");
    }
    setSaving(true);
    const payload = {
      ...form,
      price: parseInt(form.price) || 0,
      rating: parseFloat(form.rating) || 4.7,
      variants: form.has_variants ? form.variants : [],
    };
    let err;
    if (editId) {
      const { error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", editId);
      err = error;
    } else {
      const { error } = await supabase.from("menu_items").insert(payload);
      err = error;
    }
    setSaving(false);
    if (err) return alert("Gagal: " + err.message);
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Hapus menu ini?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    load();
  }

  async function toggleAvailable(m) {
    await supabase
      .from("menu_items")
      .update({ is_available: !m.is_available })
      .eq("id", m.id);
    load();
  }

  function addVariant() {
    const v = variantInput.trim();
    if (!v) return;
    if (form.variants.includes(v)) {
      alert("Varian sudah ada");
      return;
    }
    setForm({ ...form, variants: [...form.variants, v] });
    setVariantInput("");
  }

  function removeVariant(v) {
    setForm({ ...form, variants: form.variants.filter((x) => x !== v) });
  }

  const rp = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const filtered = menus.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const catLabel = (cat) => {
    if (cat === "minuman") return "Minuman";
    if (cat === "makanan") return "Makanan";
    if (cat === "snack") return "Snack";
    return cat;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Kelola Menu</h1>
          <p className="text-slate-500 mt-1 text-sm">{menus.length} menu terdaftar</p>
        </div>
        <button
          onClick={openAdd}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#e05c3a] to-[#f07a4a] text-white font-bold shadow-lg shadow-[#e05c3a]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95"
        >
          <IconPlus /> Tambah Menu
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
          <IconSearch />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari menu..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#e05c3a] focus:ring-2 focus:ring-[#e05c3a]/20 transition-all"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <IconFood />
          </div>
          <p className="text-slate-500 font-medium">Belum ada menu</p>
          <p className="text-slate-400 text-sm mt-1">Klik "Tambah Menu" untuk memulai</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const variants = Array.isArray(m.variants) ? m.variants : [];
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all flex flex-col"
              >
                <div className="relative aspect-video bg-slate-100">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <IconImage />
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider text-white ${
                      m.is_available ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {m.is_available ? "Tersedia" : "Habis"}
                  </span>
                  <span className="absolute bottom-2 left-2 bg-white/95 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider text-slate-700">
                    {catLabel(m.category)}
                  </span>
                  {m.has_variants && variants.length > 0 && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      <IconSparkle /> {variants.length} Varian
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 truncate">{m.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 h-8">
                    {m.description || "Tanpa deskripsi"}
                  </p>

                  {m.has_variants && variants.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {variants.slice(0, 4).map((v) => (
                        <span
                          key={v}
                          className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-semibold"
                        >
                          {v}
                        </span>
                      ))}
                      {variants.length > 4 && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
                          +{variants.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-lg font-bold text-[#e05c3a] mt-2">{rp(m.price)}</p>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openEdit(m)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <IconEdit /> Edit
                    </button>
                    <button
                      onClick={() => toggleAvailable(m)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        m.is_available
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {m.is_available ? "Habis" : "Ready"}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="w-10 h-9 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center justify-center"
                      aria-label="Hapus"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <form
            onSubmit={handleSave}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white p-5 border-b border-slate-100 flex items-center justify-between z-10">
              <h3 className="font-bold text-lg text-slate-800">
                {editId ? "Edit Menu" : "Tambah Menu"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <IconClose />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <Field label="Nama Menu *">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input-field"
                />
              </Field>

              <Field label="Deskripsi">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="input-field resize-none"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Harga (Rp) *">
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="input-field"
                  />
                </Field>
                <Field label="Kategori">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="makanan">Makanan</option>
                    <option value="minuman">Minuman</option>
                    <option value="snack">Snack / Cemilan</option>
                  </select>
                </Field>
              </div>

              <Field label="URL Gambar">
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="input-field"
                />
              </Field>

              {form.image_url && (
                <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                  <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              <Field label="Rating (1-5)">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="input-field"
                />
              </Field>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_favorite}
                  onChange={(e) => setForm({ ...form, is_favorite: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                Tandai sebagai Favorit
              </label>

              {/* ============ VARIAN RASA ============ */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3">
                  <input
                    type="checkbox"
                    checked={form.has_variants}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        has_variants: e.target.checked,
                        variants: e.target.checked ? form.variants : [],
                      })
                    }
                    className="w-5 h-5 rounded accent-purple-600"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-purple-800 flex items-center gap-1.5">
                      <IconSparkle /> Menu ini punya varian rasa
                    </p>
                    <p className="text-xs text-purple-600">
                      Contoh: Pop Ice (Alpukat, Coklat, Mangga, dll)
                    </p>
                  </div>
                </label>

                {form.has_variants && (
                  <div className="space-y-3 pl-2">
                    <Field label="Tambah Varian Rasa">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={variantInput}
                          onChange={(e) => setVariantInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addVariant();
                            }
                          }}
                          placeholder="Contoh: Alpukat"
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={addVariant}
                          className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                        >
                          Tambah
                        </button>
                      </div>
                    </Field>

                    {form.variants.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Daftar Varian ({form.variants.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {form.variants.map((v) => (
                            <span
                              key={v}
                              className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-semibold"
                            >
                              {v}
                              <button
                                type="button"
                                onClick={() => removeVariant(v)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                <IconClose />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-5 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#e05c3a] to-[#f07a4a] text-white font-bold disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          outline: none;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #e05c3a;
          box-shadow: 0 0 0 3px rgba(224, 92, 58, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
  }
