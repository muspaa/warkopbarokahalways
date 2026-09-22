"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconPrint = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
const IconPower = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
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
      <html><head><title>QR Meja ${t.table_number}</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:40px;background:#fff;">
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-red-50 text-red-glow">
          Meja & QR Code
        </h1>
        <p className="text-red-300/60 mt-1 text-sm">
          Kelola meja dan generate QR untuk pemesanan
        </p>
      </div>

      <form
        onSubmit={addTable}
        className="glass-card rounded-2xl p-4 flex gap-2 flex-wrap"
      >
        <input
          type="text"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          placeholder="Nomor meja (contoh: 11)"
          className="flex-1 min-w-[200px] px-4 py-3 rounded-xl text-red-50 placeholder-red-300/40 outline-none transition-all"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(239, 68, 68, 0.16)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(239, 68, 68, 0.8)";
            e.target.style.boxShadow =
              "0 0 0 3.5px rgba(239, 68, 68, 0.14), 0 0 24px rgba(239, 68, 68, 0.25)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(239, 68, 68, 0.16)";
            e.target.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl text-white font-bold flex items-center gap-2 active:scale-95 transition-all"
          style={{
            background: "linear-gradient(135deg, #ef4444, #b91c1c)",
            boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
          }}
        >
          <IconPlus /> Tambah Meja
        </button>
      </form>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="glass-card rounded-2xl text-center py-20 border-dashed">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-red-300/50"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <IconTable />
          </div>
          <p className="text-red-100 font-medium">Belum ada meja</p>
          <p className="text-red-300/60 text-sm mt-1">
            Tambah meja untuk membuat QR
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((t) => (
            <div
              key={t.id}
              className={`glass-card rounded-2xl overflow-hidden transition-all ${
                t.is_active ? "" : "opacity-60"
              }`}
              style={
                t.is_active
                  ? {}
                  : { borderColor: "rgba(239, 68, 68, 0.5)" }
              }
            >
              <div
                className="p-5 flex items-center justify-center"
                style={{ background: "rgba(255, 255, 255, 0.02)" }}
              >
                <img
                  src={qrImageUrl(t.table_number, 200)}
                  alt={`QR Meja ${t.table_number}`}
                  className="w-40 h-40 rounded-xl bg-white p-2"
                  style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-red-300/60 uppercase tracking-wider font-bold">
                      Nomor
                    </p>
                    <p className="text-2xl font-bold text-red-50 leading-tight">
                      Meja {t.table_number}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                    style={
                      t.is_active
                        ? {
                            background: "rgba(34, 197, 94, 0.15)",
                            color: "#86efac",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                          }
                        : {
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#fca5a5",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                          }
                    }
                  >
                    {t.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => downloadQR(t.table_number)}
                    className="py-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fca5a5",
                    }}
                  >
                    <IconDownload /> Unduh
                  </button>
                  <button
                    onClick={() => printQR(t)}
                    className="py-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                    style={{
                      background: "rgba(59, 130, 246, 0.15)",
                      color: "#93c5fd",
                    }}
                  >
                    <IconPrint /> Print
                  </button>
                  <button
                    onClick={() => toggleActive(t)}
                    className="py-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                    style={
                      t.is_active
                        ? {
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "#fcd34d",
                          }
                        : {
                            background: "rgba(34, 197, 94, 0.15)",
                            color: "#86efac",
                          }
                    }
                  >
                    <IconPower /> {t.is_active ? "Off" : "On"}
                  </button>
                </div>

                <button
                  onClick={() => removeTable(t.id)}
                  className="w-full mt-2 py-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#fca5a5",
                  }}
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
