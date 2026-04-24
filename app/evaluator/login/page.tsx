"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const EVALUATOR_CREDENTIALS = {
  email: "evaluator@studi.com",
  password: "evaluator123",
}

export default function EvaluatorLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    if (
      formData.email === EVALUATOR_CREDENTIALS.email &&
      formData.password === EVALUATOR_CREDENTIALS.password
    ) {
      sessionStorage.setItem("isEvaluator", "true")
      sessionStorage.setItem("evaluatorName", "Evaluator")
      router.push("/evaluator/dashboard")
    } else {
      setError("Invalid evaluator credentials")
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .ev-login * { box-sizing: border-box; margin: 0; padding: 0; }
        .ev-login { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        @keyframes evBlob {
          0%,100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.07) translateY(-20px); }
        }
        .ev-blob { animation: evBlob ease-in-out infinite; }

        @keyframes evStar {
          from { opacity: 0.1; transform: scale(0.7); }
          to   { opacity: 0.8; transform: scale(1.5); }
        }
        .ev-star { animation: evStar ease-in-out infinite alternate; }

        @keyframes evFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ev-fadeup { animation: evFadeUp .4s ease forwards; }
        .ev-fadeup-1 { animation-delay: .05s; opacity: 0; }
        .ev-fadeup-2 { animation-delay: .12s; opacity: 0; }
        .ev-fadeup-3 { animation-delay: .20s; opacity: 0; }

        @keyframes evOrbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .ev-orbit { animation: evOrbit 18s linear infinite; }
        .ev-orbit-rev { animation: evOrbit 26s linear infinite reverse; }

        .ev-inp {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all .2s;
        }
        .ev-inp::placeholder { color: rgba(255,255,255,0.25); }
        .ev-inp:focus {
          border-color: #5B6EE8;
          background: rgba(91,110,232,0.09);
          box-shadow: 0 0 0 3px rgba(91,110,232,0.18);
        }

        .ev-btn {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 11px;
          background: linear-gradient(135deg, #5B6EE8 0%, #7b5ea7 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
          letter-spacing: 0.3px;
          box-shadow: 0 6px 20px rgba(91,110,232,0.4);
        }
        .ev-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(91,110,232,0.5);
        }
        .ev-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .ev-icon-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          transition: border-color .2s;
        }
        .ev-icon-feature:hover { border-color: rgba(91,110,232,0.25); }
      `}</style>

      <div
        className="ev-login"
        style={{
          minHeight: "100vh",
          background: "#07071a",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Ambient blobs ── */}
        <div
          className="ev-blob"
          style={{
            position: "fixed", width: 500, height: 500, borderRadius: "50%",
            background: "rgba(91,110,232,0.12)", filter: "blur(100px)",
            top: -120, left: -60, animationDuration: "11s",
            pointerEvents: "none", zIndex: 0,
          }}
        />
        <div
          className="ev-blob"
          style={{
            position: "fixed", width: 380, height: 380, borderRadius: "50%",
            background: "rgba(123,94,167,0.09)", filter: "blur(80px)",
            bottom: 40, right: -40, animationDuration: "15s", animationDelay: "5s",
            pointerEvents: "none", zIndex: 0,
          }}
        />
        <div
          className="ev-blob"
          style={{
            position: "fixed", width: 240, height: 240, borderRadius: "50%",
            background: "rgba(91,110,232,0.07)", filter: "blur(60px)",
            top: "45%", right: "25%", animationDuration: "19s", animationDelay: "3s",
            pointerEvents: "none", zIndex: 0,
          }}
        />

        {/* ── Stars ── */}
        {([
          ["7%","12%","0s"],["14%","28%","0.8s"],["5%","55%","1.6s"],
          ["22%","74%","0.4s"],["11%","91%","2.1s"],["38%","5%","1.2s"],
          ["48%","96%","0.6s"],["60%","20%","1.8s"],["68%","80%","2.4s"],
          ["78%","44%","0.2s"],["85%","68%","1.4s"],["92%","33%","2.8s"],
        ] as [string,string,string][]).map(([top, left, delay], i) => (
          <div
            key={i}
            className="ev-star"
            style={{
              position: "fixed", top, left,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              borderRadius: "50%", background: "#fff",
              animationDuration: `${2.5 + (i * 0.4)}s`,
              animationDelay: delay, pointerEvents: "none", zIndex: 0,
            }}
          />
        ))}

        {/* ── Navbar ── */}
        <nav
          style={{
            position: "relative", zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 40px",
            background: "rgba(7,7,26,0.7)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
              STU<span style={{ color: "#7f9fff" }}>DI</span>
            </span>
          </Link>
          <div
            style={{
              fontSize: 11, fontWeight: 700,
              color: "#9baeff",
              background: "rgba(91,110,232,0.15)",
              border: "1px solid rgba(91,110,232,0.3)",
              borderRadius: 100,
              padding: "5px 14px",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Evaluator Portal
          </div>
        </nav>

        {/* ── Main ── */}
        <main
          style={{
            position: "relative", zIndex: 1,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            gap: 60,
            flexWrap: "wrap",
          }}
        >
          {/* ── Left: Illustration ── */}
          <div
            className="ev-fadeup ev-fadeup-1"
            style={{
              flex: "1 1 320px",
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            {/* Animated icon graphic */}
            <div style={{ position: "relative", width: 220, height: 220 }}>
              {/* Outer orbiting ring */}
              <svg
                className="ev-orbit"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                viewBox="0 0 220 220" fill="none"
              >
                <circle cx="110" cy="110" r="100" stroke="rgba(91,110,232,0.15)" strokeWidth="1" strokeDasharray="6 5" />
                <circle cx="110" cy="10" r="5" fill="#5B6EE8" opacity="0.7" />
                <circle cx="210" cy="110" r="3.5" fill="#9baeff" opacity="0.5" />
              </svg>
              {/* Inner orbiting ring */}
              <svg
                className="ev-orbit-rev"
                style={{ position: "absolute", inset: 20, width: "calc(100% - 40px)", height: "calc(100% - 40px)" }}
                viewBox="0 0 180 180" fill="none"
              >
                <circle cx="90" cy="90" r="78" stroke="rgba(123,94,167,0.12)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="90" cy="12" r="4" fill="#7b5ea7" opacity="0.6" />
              </svg>
              {/* Center circle */}
              <div
                style={{
                  position: "absolute",
                  inset: 40,
                  borderRadius: "50%",
                  background: "rgba(91,110,232,0.1)",
                  border: "1px solid rgba(91,110,232,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {/* Clipboard icon */}
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="8" y="10" width="24" height="26" rx="3" stroke="#7f9fff" strokeWidth="1.5" />
                  <path d="M15 6h10v6H15V6z" stroke="#7f9fff" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M13 20h14M13 25h14M13 30h8" stroke="#7f9fff" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="32" cy="32" r="6" fill="#51CF66" />
                  <path d="M29.5 32l1.5 1.5 3-3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Text block */}
            <div style={{ textAlign: "center", maxWidth: 320 }}>
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 10px",
                  letterSpacing: -0.5,
                }}
              >
                Evaluator Portal
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: 0 }}>
                Review AI-generated quiz questions and evaluate their alignment with Anderson &amp; Krathwohl&apos;s Revised Bloom&apos;s Taxonomy.
              </p>
            </div>

            {/* Feature list */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "📋", label: "Review quiz questions", sub: "Evaluate cognitive alignment" },
                { icon: "📊", label: "Track evaluation progress", sub: "See pending & completed" },
                { icon: "🎯", label: "4-criteria rubric scoring", sub: "Verb, complexity, clarity, relevance" },
              ].map((f) => (
                <div key={f.label} className="ev-icon-feature">
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Login card ── */}
          <div
            className="ev-fadeup ev-fadeup-2"
            style={{
              flex: "0 0 360px",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 22,
              padding: "32px 28px",
              boxShadow: "0 32px 64px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Card header */}
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(91,110,232,0.15)",
                  border: "1px solid rgba(91,110,232,0.3)",
                  borderRadius: 100,
                  padding: "4px 12px",
                  marginBottom: 14,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9baeff",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <circle cx="4" cy="4" r="4" fill="#5B6EE8" />
                  <circle cx="4" cy="4" r="2" fill="#9baeff" />
                </svg>
                Evaluator Access
              </div>
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 6px",
                  letterSpacing: -0.5,
                }}
              >
                Welcome back
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                Sign in to the evaluation portal
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(255,107,107,0.12)",
                  border: "1px solid rgba(255,107,107,0.25)",
                  color: "#ff8f8f",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  marginBottom: 18,
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.9px",
                    textTransform: "uppercase",
                    marginBottom: 7,
                  }}
                >
                  Email
                </label>
                <input
                  suppressHydrationWarning
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="evaluator@studi.com"
                  className="ev-inp"
                  required
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.9px",
                    textTransform: "uppercase",
                    marginBottom: 7,
                  }}
                >
                  Password
                </label>
                <input
                  suppressHydrationWarning
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="ev-inp"
                  required
                />
              </div>

              {/* Submit */}
              <button suppressHydrationWarning type="submit" className="ev-btn" disabled={loading}>
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                margin: "22px 0 18px",
              }}
            />

            {/* Back link */}
            <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Not an evaluator?{" "}
              <Link
                href="/"
                style={{
                  color: "#7f9fff",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Back to main site →
              </Link>
            </div>

            {/* Demo hint */}
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Demo credentials:</span>{" "}
              evaluator@studi.com / evaluator123
            </div>
          </div>
        </main>

        {/* ── Footer ── */}
        <div
          className="ev-fadeup ev-fadeup-3"
          style={{
            position: "relative", zIndex: 1,
            textAlign: "center",
            padding: "20px 24px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            fontSize: 12,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          © 2025 STUDI — Central Mindanao University Capstone Project
        </div>
      </div>
    </>
  )
}