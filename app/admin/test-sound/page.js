"use client";

import { useRef, useState } from "react";

export default function TestSoundPage() {
  const audioCtxRef = useRef(null);
  const [status, setStatus] = useState("Klik tombol untuk test");

  function initAudio() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      audioCtxRef.current.resume();
      setStatus("✅ Audio Context siap");
      return audioCtxRef.current;
    } catch (e) {
      setStatus("❌ Error: " + e.message);
      return null;
    }
  }

  function playSound(style) {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (style === "ting") {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      o.start(now);
      o.stop(now + 0.5);
      setStatus("🔔 Ting!");
    } else if (style === "bell") {
      [880, 660, 1100].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.value = freq;
        const t = now + i * 0.2;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.4, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.start(t);
        o.stop(t + 0.4);
      });
      setStatus("🔔🔔🔔 Bell 3 nada!");
    } else if (style === "chime") {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.value = freq;
        const t = now + i * 0.15;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.3, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        o.start(t);
        o.stop(t + 0.6);
      });
      setStatus("🎵 Chime 4 nada!");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Test Suara Notifikasi</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Coba berbagai jenis suara untuk notifikasi pesanan
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Status:</strong> {status}
          </p>
        </div>

        <div className="grid gap-3">
          <button
            onClick={() => playSound("ting")}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            🔔 Ting (1 nada pendek)
          </button>

          <button
            onClick={() => playSound("bell")}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            🔔🔔🔔 Bell (3 nada bertingkat)
          </button>

          <button
            onClick={() => playSound("chime")}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            🎵 Chime (4 nada lembut)
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Suara notifikasi default pakai <strong>Bell (3 nada)</strong>
        </p>
      </div>
    </div>
  );
    }
