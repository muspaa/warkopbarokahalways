"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setDebugInfo("");
    setLoading(true);

    try {
      // Cek env
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      setDebugInfo(`URL: ${url ? url.substring(0, 30) + "..." : "❌ KOSONG"}\nKEY: ${key ? "✅ ADA" : "❌ KOSONG"}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);

      setLoading(false);

      if (error) {
        setError(`❌ ${error.message}`);
        setDebugInfo((prev) => prev + `\n\nError code: ${error.status || "?"}`);
        return;
      }

      if (!data?.session) {
        setError("⚠️ Login sukses tapi session kosong");
        return;
      }

      setDebugInfo((prev) => prev + "\n\n✅ Login sukses, redirect...");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("CATCH:", err);
      setLoading(false);
      setError(`💥 Error: ${err.message}`);
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
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 break-words">
              {error}
            </p>
          )}
          {debugInfo && (
            <pre className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 whitespace-pre-wrap break-words font-mono">
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
