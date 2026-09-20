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
};

export default function MenuPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

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
    });
    setEditId(m.id);
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Nama wajib diisi");
    if (!form.price) return alert("Harga wajib diisi");
    setSaving(true);
    const payload = {
      ...form,
      price: parseInt(form.price) || 0,
      rating: parseFloat(form.rating) || 4.7,
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
    if (err) {
      alert("Gagal: " + err.message);
      return;
    }
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

  const rp = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const filtered = menus.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Menu</h1>
          <p className="text-slate-500 mt-1">{menus.length} menu terdaftar</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold shadow-lg"
        >
          + Tambah Menu
        </button>
      </div>

      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari menu..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#d4a24c]"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-5xl mb-2">🍽️</div>
          <p className="text-slate-500">Belum ada menu</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
            >
              <div className="relative aspect-video bg-slate-100">
                {m.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.image_url}
                    alt={m.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                    🍴
                  </div>
                )}
                <span
                  className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${
                    m.is_available
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {m.is_available ? "Tersedia" : "Habis"}
                </span>
                <span className="absolute bottom-2 left-2 bg-white/95 text-xs font-semibold px-2 py-1 rounded-full">
                  {m.category === "minuman" ? "☕ Minuman" : "🍽 Makanan"}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-slate-800 truncate">{m.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 h-8">
                  {m.description || "-"}
                </p>
                <p className="text-lg font-bold text-[#d4a24c] mt-2">
                  {rp(m.price)}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(m)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleAvailable(m)}
                    className="flex-1 py-2 rounded-xl bg-amber-100 text-amber-700 text-sm font-semibold"
                  >
                    {m.is_available ? "Set Habis" : "Set Ready"}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="w-10 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <form
            onSubmit={handleSave}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <h3 className="font-bold text-lg">
              {editId ? "Edit Menu" : "Tambah Menu"}
            </h3>

            <Field label="Nama Menu *">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#d4a24c]"
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#d4a24c] resize-none"
              />
            </Field>

            <Field label="Harga (Rp) *">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#d4a24c]"
              />
            </Field>

            <Field label="URL Gambar">
              <input
                type="text"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                placeholder="https://..."
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#d4a24c]"
              />
            </Field>

            <Field label="Kategori">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              >
                <option value="makanan">Makanan</option>
                <option value="minuman">Minuman</option>
              </select>
            </Field>

            <Field label="Rating (1-5)">
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_favorite}
                onChange={(e) =>
                  setForm({ ...form, is_favorite: e.target.checked })
                }
              />
              Tandai sebagai Favorit
            </label>

            {form.image_url && (
              <div className="rounded-xl overflow-hidden aspect-video bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 uppercase">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}