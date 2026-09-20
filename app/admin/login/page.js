"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setDebugInfo("Memulai login...\n");
    setLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      setDebugInfo(
        `URL: ${url || "❌ KOSONG"}\n` +
        `KEY: ${key ? "✅ ADA (" + key.substring(0, 20) + "...)" : "❌ KOSONG"}\n\n` +
        `Mengirim request...`
      );

      if (!url || !key) {
        setError("Env Supabase tidak terbaca di Vercel!");
        setLoading(false);
        return;
      }

      // Timeout 15 detik
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": key,
        },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json();

      setDebugInfo((prev) =>
        prev + `\n\nStatus: ${res.status}\nRespon: ${JSON.stringify(data).substring(0, 200)}`
      );

      if (!res.ok) {
        setError(`❌ ${data.error_description || data.msg || data.error || "Login gagal"}`);
        setLoading(false);
        return;
      }

      setDebugInfo((prev) => prev + "\n\n✅ Login sukses! Simpan session...");

      // Simpan session manual
      if (data.access_token) {
        localStorage.setItem("sb-access-token", data.access_token);
        localStorage.setItem("sb-refresh-token", data.refresh_token);

        setDebugInfo((prev) => prev + "\n\n🚀 Redirect ke /admin...");
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1000);
      } else {
        setError("Login sukses tapi token kosong");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      if (err.name === "AbortError") {
        setError("⏱️ Timeout: Supabase tidak merespon dalam 15 detik");
        setDebugInfo((prev) => prev + "\n\n❌ Request dibatalkan karena timeout");
      } else {
        setError(`💥 ${err.message}`);
        setDebugInfo((prev) => prev + `\n\n❌ Error: ${err.message}`);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#d4a24c] to-[#e8bd6e] flex items-center justify-center text-3xl mb-4">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-sm text-slate-300 mt-2">Warkop Barockah Always</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-[#d4a24c] focus:ring-2 focus:ring-[#d4a24c]/30"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-[#d4a24c] focus:ring-2 focus:ring-[#d4a24c]/30"
          />

          {error && (
            <div className="text-sm text-red-200 bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 break-words">
              {error}
            </div>
          )}

          {debugInfo && (
            <pre className="text-xs text-amber-200 bg-black/40 border border-amber-500/30 rounded-xl px-3 py-2 whitespace-pre-wrap break-words font-mono max-h-48 overflow-y-auto">
              {debugInfo}
            </pre>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-[#1a1408] bg-gradient-to-r from-[#d4a24c] to-[#e8bd6e] disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
