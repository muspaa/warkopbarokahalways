"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

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
    const { data } = await supabase
      .from("tables")
      .select("*")
      .order("table_number");
    setTables(data || []);
    setLoading(false);
  }

  async function addTable(e) {
    e.preventDefault();
    const num = newNumber.trim();
    if (!num) return;
    const { error } = await supabase
      .from("tables")
      .insert({ table_number: num });
    if (error) {
      alert("Gagal: " + error.message);
      return;
    }
    setNewNumber("");
    load();
  }

  async function removeTable(id) {
    if (!confirm("Hapus meja ini?")) return;
    await supabase.from("tables").delete().eq("id", id);
    load();
  }

  async function toggleActive(t) {
    await supabase
      .from("tables")
      .update({ is_active: !t.is_active })
      .eq("id", t.id);
    load();
  }

  const menuUrl = (n) => `${baseUrl}/?meja=${n}`;
  const qrImageUrl = (n, size = 300) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      menuUrl(n)
    )}`;

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
      <html>
      <head><title>QR Meja ${t.table_number}</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:40px;">
        <h1>Meja ${t.table_number}</h1>
        <p>Scan untuk pesan</p>
        <img src="${qrImageUrl(t.table_number, 400)}" style="border:8px solid #000;border-radius:20px;" />
        <p style="margin-top:20px;color:#666;font-size:12px;">${menuUrl(t.table_number)}</p>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    w.document.close();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Meja & QR Code</h1>
        <p className="text-slate-500 mt-1">
          Kelola meja dan generate QR code untuk pemesanan
        </p>
      </div>

      <form
        onSubmit={addTable}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-2 flex-wrap"
      >
        <input
          type="text"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          placeholder="Nomor meja (contoh: 11)"
          className="flex-1 min-w-[200px] p-3 rounded-xl border border-slate-200 outline-none focus:border-[#d4a24c]"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4a24c] to-[#e8bd6e] text-[#1a1408] font-bold"
        >
          + Tambah Meja
        </button>
      </form>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-5xl mb-2">🪑</div>
          <p className="text-slate-500">Belum ada meja</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 ${
                t.is_active ? "border-slate-100" : "border-red-200 opacity-70"
              }`}
            >
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-5 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl(t.table_number, 200)}
                  alt={`QR Meja ${t.table_number}`}
                  className="w-40 h-40 rounded-xl shadow-md bg-white p-2"
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Nomor
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      Meja {t.table_number}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      t.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => downloadQR(t.table_number)}
                    className="py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    ⬇ Unduh
                  </button>
                  <button
                    onClick={() => printQR(t)}
                    className="py-2 rounded-xl bg-blue-100 text-blue-700 text-xs font-semibold"
                  >
                    🖨 Print
                  </button>
                  <button
                    onClick={() => toggleActive(t)}
                    className="py-2 rounded-xl bg-amber-100 text-amber-700 text-xs font-semibold"
                  >
                    {t.is_active ? "Off" : "On"}
                  </button>
                </div>

                <button
                  onClick={() => removeTable(t.id)}
                  className="w-full mt-2 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold"
                >
                  Hapus Meja
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}