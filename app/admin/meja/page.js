"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

/* ========== ICON ========== */
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconPrint = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
const IconPower = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

export default function MejaPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNumber, setNewNumber] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setBaseUrl(window.location.origin);
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("tables").select("*").order("table_number");
    setTables(data || []);
    setLoading(false);
  }

  async function addTable(e) {
    e.preventDefault();
    const num = newNumber.trim();
    if (!num) return;
    const { error } = await supabase.from("tables").insert({ table_number: num });
    if (error) return alert("Gagal: " + error.message);
    setNewNumber("");
    load();
  }

  async function removeTable(id) {
    if (!confirm("Hapus meja ini?")) return;
    await supabase.from("tables").delete().eq("id", id);
    load();
  }

  async function toggleActive(t) {
    await supabase.from("tables").update({ is_active: !t.is_active }).eq("id", t.id);
    load();
  }

  const menuUrl = (n) => `${baseUrl}/?meja=${n}`;
  const qrImageUrl = (n, size = 300) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(menuUrl(n))}`;

  function downloadQR(n) {
    const link = document.createElement("a");
    link.href = qrImageUrl(n, 500);
    link.download = `QR-Meja-${n}.png`;
    link.target = "_blank";
    link.click();
  }

  function printQR(t) {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>QR Meja ${t.table_number}</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:40px;">
        <h1>Meja ${t.table_number}</h1>
        <p>Scan untuk pesan</p>
        <img src="${qrImageUrl(t.table_number, 400)}" style="border:8px solid #000;border-radius:20px;" />
        <p style="margin-top:20px;color:#666;font-size:12px;">${menuUrl(t.table_number)}</p>
        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    w.document.close();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Meja & QR Code</h1>
        <p className="text-slate-500 mt-1 text-sm">Kelola meja dan generate QR untuk pemesanan</p>
      </div>

      {/* Add Form */}
      <form onSubmit={addTable} className="bg-white rounded-2xl p-4 border border-slate-200 flex gap-2 flex-wrap">
        <input
          type="text"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          placeholder="Nomor meja (contoh: 11)"
          className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#d4a24c] focus:ring-2 focus:ring-[#d4a24c]/20 transition-all text-sm"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold shadow-lg shadow-[#d4a24c]/30 hover:shadow-xl transition-all flex items-center gap-2 active:scale-95"
        >
          <IconPlus /> Tambah Meja
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <IconTable />
          </div>
          <p className="text-slate-500 font-medium">Belum ada meja</p>
          <p className="text-slate-400 text-sm mt-1">Tambah meja untuk membuat QR</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-2xl overflow-hidden border-2 transition-all ${
                t.is_active ? "border-slate-200" : "border-red-200 opacity-70"
              }`}
            >
              <div className="bg-slate-50 p-5 flex items-center justify-center">
                <img
                  src={qrImageUrl(t.table_number, 200)}
                  alt={`QR Meja ${t.table_number}`}
                  className="w-40 h-40 rounded-xl shadow-md bg-white p-2 border border-slate-200"
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Nomor</p>
                    <p className="text-2xl font-bold text-slate-800 leading-tight">Meja {t.table_number}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      t.is_active
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {t.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => downloadQR(t.table_number)}
                    className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <IconDownload /> Unduh
                  </button>
                  <button
                    onClick={() => printQR(t)}
                    className="py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <IconPrint /> Print
                  </button>
                  <button
                    onClick={() => toggleActive(t)}
                    className={`py-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 ${
                      t.is_active
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-700"
                        : "bg-green-100 hover:bg-green-200 text-green-700"
                    }`}
                  >
                    <IconPower /> {t.is_active ? "Off" : "On"}
                  </button>
                </div>

                <button
                  onClick={() => removeTable(t.id)}
                  className="w-full mt-2 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <IconTrash /> Hapus Meja
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  }
