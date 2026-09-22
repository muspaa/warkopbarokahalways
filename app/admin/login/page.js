"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);

  const videoRef = useRef(null);
  const skipToAdminRef = useRef(false);

  // ========== HANDLE LOGIN ==========
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let email = username.trim();
      if (!email.includes("@")) {
        email = `${email}@gmail.com`;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!data?.session) {
        setError("Session kosong");
        setLoading(false);
        return;
      }

      // Sukses → tampilkan dashboard video
      setShowDashboard(true);
      skipToAdminRef.current = false;

      // Putar video setelah render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = false;
          videoRef.current.volume = 1;
          const playAttempt = videoRef.current.play();
          if (playAttempt !== undefined) {
            playAttempt.catch(() => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.play().catch(() => {});
              }
            });
          }
        }
      }, 100);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  // ========== VIDEO HABIS → OTOMATIS KE DASHBOARD ==========
  function handleVideoEnded() {
    if (skipToAdminRef.current) return;
    skipToAdminRef.current = true;
    if (videoRef.current) {
      videoRef.current.pause();
    }
    router.push("/admin");
  }

  // ========== SKIP → LANJUT KE DASHBOARD ==========
  function handleSkip() {
    if (skipToAdminRef.current) return;
    skipToAdminRef.current = true;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setShowDashboard(false);
    router.push("/admin");
  }

  // ========== SPACEBAR PLAY/PAUSE ==========
  useEffect(() => {
    function handleKey(e) {
      if (
        e.code === "Space" &&
        showDashboard &&
        e.target.tagName !== "INPUT"
      ) {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showDashboard]);

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        body {
          min-height: 100vh;
          background: #0a0304;
          overflow: hidden;
        }

        /* ================= LOGIN PAGE ================= */
        #loginPage {
          position: fixed;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background:
            radial-gradient(ellipse 70% 55% at 50% 0%, rgba(239, 68, 68, 0.22), transparent 65%),
            radial-gradient(ellipse 60% 50% at 85% 100%, rgba(190, 18, 60, 0.18), transparent 60%),
            radial-gradient(ellipse 50% 40% at 10% 90%, rgba(220, 38, 38, 0.14), transparent 60%),
            #0a0304;
          transition: opacity 0.6s ease, transform 0.6s ease;
          z-index: 10;
          padding: 20px;
        }

        #loginPage.hidden {
          opacity: 0;
          transform: scale(1.08);
          pointer-events: none;
        }

        #loginPage::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(239, 68, 68, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.05) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 65% 65% at 50% 50%, #000 25%, transparent 72%);
          -webkit-mask-image: radial-gradient(ellipse 65% 65% at 50% 50%, #000 25%, transparent 72%);
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          opacity: 0.5;
        }
        .orb-1 {
          width: 420px; height: 420px;
          background: #ef4444;
          top: -140px; left: -140px;
          animation: drift 13s ease-in-out infinite;
        }
        .orb-2 {
          width: 340px; height: 340px;
          background: #dc2626;
          bottom: -120px; right: -120px;
          animation: drift 13s ease-in-out infinite reverse;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(45px, -35px) scale(1.1); }
        }

        .login-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 400px;
          background: rgba(20, 6, 8, 0.75);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(239, 68, 68, 0.22);
          border-radius: 20px;
          padding: 42px 36px;
          box-shadow:
            0 24px 64px rgba(0, 0, 0, 0.7),
            0 0 60px rgba(239, 68, 68, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          animation: cardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          transition: transform 0.4s ease, opacity 0.4s ease;
        }

        .login-card.loading {
          transform: scale(0.97);
          opacity: 0.85;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .lock-badge {
          width: 60px;
          height: 60px;
          margin: 0 auto 32px;
          border-radius: 17px;
          background: linear-gradient(145deg, rgba(239, 68, 68, 0.22), rgba(190, 18, 60, 0.14));
          border: 1px solid rgba(248, 113, 113, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow:
            0 8px 28px rgba(239, 68, 68, 0.35),
            0 0 40px rgba(239, 68, 68, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: badgeGlow 3s ease-in-out infinite;
        }

        @keyframes badgeGlow {
          0%, 100% { box-shadow: 0 8px 28px rgba(239, 68, 68, 0.35), 0 0 40px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
          50%      { box-shadow: 0 8px 32px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
        }

        .lock-badge::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 24px;
          background: radial-gradient(circle, rgba(239, 68, 68, 0.35), transparent 70%);
          z-index: -1;
          filter: blur(10px);
        }

        .lock-badge svg {
          width: 28px;
          height: 28px;
          stroke: #fca5a5;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.7));
        }

        .input-group {
          position: relative;
          margin-bottom: 14px;
        }

        .input-group input {
          width: 100%;
          padding: 15px 44px 15px 46px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(239, 68, 68, 0.16);
          border-radius: 11px;
          color: #fee2e2;
          font-size: 14.5px;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
        }

        .input-group input::placeholder {
          color: #6b3535;
        }

        .input-group input:hover {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .input-group input:focus {
          border-color: rgba(239, 68, 68, 0.8);
          background: rgba(239, 68, 68, 0.06);
          box-shadow:
            0 0 0 3.5px rgba(239, 68, 68, 0.14),
            0 0 24px rgba(239, 68, 68, 0.25);
        }

        .input-group .field-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          stroke: #6b3535;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: stroke 0.25s, filter 0.25s;
          pointer-events: none;
        }

        .input-group input:focus ~ .field-icon {
          stroke: #f87171;
          filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.7));
        }

        .toggle-pass {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          cursor: pointer;
          stroke: #6b3535;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: stroke 0.25s, filter 0.25s;
        }
        .toggle-pass:hover {
          stroke: #f87171;
          filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.7));
        }

        .login-btn {
          width: 100%;
          padding: 15px;
          margin-top: 14px;
          background: linear-gradient(135deg, #ef4444, #b91c1c);
          border: none;
          border-radius: 11px;
          color: #fff;
          font-size: 14.5px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.25s, filter 0.25s;
          box-shadow:
            0 8px 24px rgba(239, 68, 68, 0.4),
            0 0 32px rgba(239, 68, 68, 0.25);
          position: relative;
          overflow: hidden;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 51px;
        }

        .login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .login-btn:hover:not(:disabled)::before {
          transform: translateX(100%);
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-1.5px);
          box-shadow:
            0 12px 32px rgba(239, 68, 68, 0.55),
            0 0 48px rgba(239, 68, 68, 0.45);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
          filter: brightness(0.92);
        }

        .login-btn:disabled {
          cursor: default;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: none;
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.6));
        }

        .login-btn.loading .spinner {
          display: block;
        }

        .login-btn.loading .btn-text {
          display: none;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ================= DASHBOARD / VIDEO ================= */
        #dashboard {
          position: fixed;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.8s ease, visibility 0.8s ease;
          background: #000;
          z-index: 5;
        }

        #dashboard.active {
          opacity: 1;
          visibility: visible;
        }

        #dashboard video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #000;
        }

        .dash-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom,
            rgba(0,0,0,0.55) 0%,
            transparent 20%,
            transparent 75%,
            rgba(0,0,0,0.55) 100%);
          pointer-events: none;
        }

        .top-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          padding: 22px 30px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          z-index: 3;
          animation: fadeDown 0.7s ease 0.5s both;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .skip-btn {
          padding: 10px 20px;
          background: rgba(239, 68, 68, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(248, 113, 113, 0.45);
          border-radius: 10px;
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.25);
        }

        .skip-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: translateY(-1px);
          box-shadow: 0 0 32px rgba(239, 68, 68, 0.6);
        }

        .skip-btn:active {
          transform: translateY(0) scale(0.97);
        }

        .skip-btn svg {
          width: 15px;
          height: 15px;
          stroke: #fff;
          fill: none;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.6));
        }

        @media (max-width: 600px) {
          .login-card { padding: 34px 24px; }
          .top-bar { padding: 16px 18px; }
          .skip-btn { padding: 9px 16px; font-size: 12.5px; }
        }
      `}</style>

      {/* ================= LOGIN PAGE ================= */}
      <div id="loginPage" className={showDashboard ? "hidden" : ""}>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>

        <div className={`login-card ${loading ? "loading" : ""}`}>
          <div className="lock-badge">
            <svg viewBox="0 0 24 24">
              <rect x="3.5" y="10.5" width="17" height="11" rx="2.5" />
              <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
              <circle cx="12" cy="16" r="1.6" fill="#fca5a5" stroke="none" />
              <line x1="12" y1="17.5" x2="12" y2="19.5" />
            </svg>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Email"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <svg className="field-icon" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="input-group">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <svg className="field-icon" viewBox="0 0 24 24">
                <rect x="4" y="10.5" width="16" height="10.5" rx="2.2" />
                <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
              </svg>
              <svg
                className="toggle-pass"
                viewBox="0 0 24 24"
                onClick={() => setShowPass(!showPass)}
                style={{ stroke: showPass ? "#f87171" : "#6b3535" }}
              >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>

            {error && (
              <p
                style={{
                  color: "#fca5a5",
                  fontSize: "12.5px",
                  textAlign: "center",
                  marginBottom: "8px",
                  marginTop: "4px",
                }}
              >
                {error}
              </p>
            )}

            <button type="submit" className={`login-btn ${loading ? "loading" : ""}`} disabled={loading}>
              <span className="btn-text">MASUK</span>
              <span className="spinner"></span>
            </button>
          </form>
        </div>
      </div>

      {/* ================= DASHBOARD VIDEO ================= */}
      <div id="dashboard" className={showDashboard ? "active" : ""}>
        <video
          ref={videoRef}
          playsInline
          preload="auto"
          onEnded={handleVideoEnded}
        >
          <source src="https://cdn.zass.in/GyFjDgCGBI.mp4" type="video/mp4" />
          Browser Anda tidak mendukung video.
        </video>
        <div className="dash-overlay"></div>

        <div className="top-bar">
          <button className="skip-btn" onClick={handleSkip}>
            <svg viewBox="0 0 24 24">
              <polygon points="5 4 15 12 5 20 5 4" fill="#fff" stroke="none" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
            SKIP
          </button>
        </div>
      </div>
    </>
  );
                  }
