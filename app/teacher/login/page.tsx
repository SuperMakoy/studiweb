"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/**
 * STATIC PROTOTYPE - Teacher Login
 * 
 * This is a mockup/prototype for HCI project demonstration.
 * Uses hardcoded credentials and sessionStorage for demo purposes only.
 */
const TEACHER_CREDENTIALS = {
  email: "teacher@studi.com",
  password: "teacher123",
}

export default function TeacherLoginPage() {
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
      formData.email === TEACHER_CREDENTIALS.email &&
      formData.password === TEACHER_CREDENTIALS.password
    ) {
      sessionStorage.setItem("isTeacher", "true")
      sessionStorage.setItem("teacherName", "Teacher")
      router.push("/teacher/dashboard")
    } else {
      setError("Invalid teacher credentials")
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .tc-login * { box-sizing: border-box; margin: 0; padding: 0; }
        .tc-login { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        @keyframes tcBlob {
          0%,100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.07) translateY(-20px); }
        }
        .tc-blob { animation: tcBlob ease-in-out infinite; }

        @keyframes tcStar {
          from { opacity: 0.1; transform: scale(0.7); }
          to   { opacity: 0.8; transform: scale(1.5); }
        }
        .tc-star { animation: tcStar ease-in-out infinite alternate; }

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-fadeup { animation: tcFadeUp .4s ease forwards; }
        .tc-fadeup-1 { animation-delay: .05s; opacity: 0; }
        .tc-fadeup-2 { animation-delay: .12s; opacity: 0; }
        .tc-fadeup-3 { animation-delay: .20s; opacity: 0; }

        @keyframes tcOrbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .tc-orbit { animation: tcOrbit 18s linear infinite; }
        .tc-orbit-rev { animation: tcOrbit 26s linear infinite reverse; }

        .tc-inp {
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
        .tc-inp::placeholder { color: rgba(255,255,255,0.25); }
        .tc-inp:focus {
          border-color: #58d68d;
          background: rgba(88,214,141,0.09);
          box-shadow: 0 0 0 3px rgba(88,214,141,0.18);
        }

        .tc-btn {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 11px;
          background: linear-gradient(135deg, #58d68d 0%, #45b078 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
          letter-spacing: 0.3px;
          box-shadow: 0 6px 20px rgba(88,214,141,0.4);
        }
        .tc-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(88,214,141,0.5);
        }
        .tc-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .tc-icon-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          transition: border-color .2s;
        }
        .tc-icon-feature:hover { border-color: rgba(88,214,141,0.25); }
      `}</style>

      <div
        className="tc-login"
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
        {/* Ambient blobs */}
        <div
          className="tc-blob"
          style={{
            position: "fixed", width: 500, height: 500, borderRadius: "50%",
            background: "rgba(88,214,141,0.12)", filter: "blur(100px)",
            top: -120, left: -60, animationDuration: "11s",
            pointerEvents: "none", zIndex: 0,
          }}
        />
        <div
          className="tc-blob"
          style={{
            position: "fixed", width: 380, height: 380, borderRadius: "50%",
            background: "rgba(69,176,120,0.09)", filter: "blur(80px)",
            bottom: 40, right: -40, animationDuration: "15s", animationDelay: "5s",
            pointerEvents: "none", zIndex: 0,
          }}
        />
        <div
          className="tc-blob"
          style={{
            position: "fixed", width: 240, height: 240, borderRadius: "50%",
            background: "rgba(88,214,141,0.07)", filter: "blur(60px)",
            top: "45%", right: "25%", animationDuration: "19s", animationDelay: "3s",
            pointerEvents: "none", zIndex: 0,
          }}
        />

        {/* Stars */}
        {([
          ["7%","12%","0s"],["14%","28%","0.8s"],["5%","55%","1.6s"],
          ["22%","74%","0.4s"],["11%","91%","2.1s"],["38%","5%","1.2s"],
          ["48%","96%","0.6s"],["60%","20%","1.8s"],["68%","80%","2.4s"],
          ["78%","44%","0.2s"],["85%","68%","1.4s"],["92%","33%","2.8s"],
        ] as [string,string,string][]).map(([top, left, delay], i) => (
          <div
            key={i}
            className="tc-star"
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

        {/* Navbar */}
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
              STU<span style={{ color: "#58d68d" }}>DI</span>
            </span>
          </Link>
          <div
            style={{
              fontSize: 11, fontWeight: 700,
              color: "#7dcea0",
              background: "rgba(88,214,141,0.15)",
              border: "1px solid rgba(88,214,141,0.3)",
              borderRadius: 100,
              padding: "5px 14px",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Teacher Portal
          </div>
        </nav>

        {/* Prototype Banner */}
        <div
          style={{
            background: "linear-gradient(90deg, rgba(255,212,59,0.15), rgba(255,212,59,0.05))",
            borderBottom: "1px solid rgba(255,212,59,0.3)",
            padding: "8px 40px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            position: "relative", zIndex: 10,
          }}
        >
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ fontSize: 12, color: "#FFD43B", fontWeight: 500 }}>
            STATIC PROTOTYPE - This Teacher Portal is for HCI demonstration only. Backend is not connected.
          </span>
        </div>

        {/* Main */}
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
          {/* Left: Illustration */}
          <div
            className="tc-fadeup tc-fadeup-1"
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
                className="tc-orbit"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                viewBox="0 0 220 220" fill="none"
              >
                <circle cx="110" cy="110" r="100" stroke="rgba(88,214,141,0.15)" strokeWidth="1" strokeDasharray="6 5" />
                <circle cx="110" cy="10" r="5" fill="#58d68d" opacity="0.7" />
                <circle cx="210" cy="110" r="3.5" fill="#7dcea0" opacity="0.5" />
              </svg>
              {/* Inner orbiting ring */}
              <svg
                className="tc-orbit-rev"
                style={{ position: "absolute", inset: 20, width: "calc(100% - 40px)", height: "calc(100% - 40px)" }}
                viewBox="0 0 180 180" fill="none"
              >
                <circle cx="90" cy="90" r="78" stroke="rgba(69,176,120,0.12)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="90" cy="12" r="4" fill="#45b078" opacity="0.6" />
              </svg>
              {/* Center circle */}
              <div
                style={{
                  position: "absolute",
                  inset: 40,
                  borderRadius: "50%",
                  background: "rgba(88,214,141,0.1)",
                  border: "1px solid rgba(88,214,141,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {/* Book/Quiz icon */}
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="6" y="8" width="28" height="24" rx="2" stroke="#58d68d" strokeWidth="1.5" />
                  <path d="M20 8v24" stroke="#58d68d" strokeWidth="1.5" />
                  <path d="M10 14h6M10 18h5M10 22h6M24 14h6M24 18h5M24 22h6" stroke="#58d68d" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="32" cy="30" r="6" fill="#FFD43B" />
                  <path d="M30 30l1.5 1.5 3-3" stroke="#07071a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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
                Teacher Portal
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: 0 }}>
                Create AI-powered quizzes aligned with Bloom&apos;s Taxonomy for your students. Upload content and configure cognitive levels.
              </p>
            </div>

            {/* Feature list */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "📤", label: "Upload study materials", sub: "TXT, DOC, DOCX supported" },
                { icon: "🎯", label: "Configure cognitive levels", sub: "Bloom's Taxonomy alignment" },
                { icon: "📊", label: "Set difficulty & count", sub: "Customize quiz parameters" },
              ].map((f) => (
                <div key={f.label} className="tc-icon-feature">
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login card */}
          <div
            className="tc-fadeup tc-fadeup-2"
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
                  background: "rgba(88,214,141,0.15)",
                  border: "1px solid rgba(88,214,141,0.3)",
                  borderRadius: 100,
                  padding: "4px 12px",
                  marginBottom: 14,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#7dcea0",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <circle cx="4" cy="4" r="4" fill="#58d68d" />
                  <circle cx="4" cy="4" r="2" fill="#7dcea0" />
                </svg>
                Teacher Access
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
                Sign in to the teacher portal
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
                  placeholder="teacher@studi.com"
                  className="tc-inp"
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
                  className="tc-inp"
                  required
                />
              </div>

              {/* Submit */}
              <button suppressHydrationWarning type="submit" className="tc-btn" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
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
              Not a teacher?{" "}
              <Link
                href="/"
                style={{
                  color: "#58d68d",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Back to main site
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
              teacher@studi.com / teacher123
            </div>
          </div>
        </main>

        {/* Footer */}
        <div
          className="tc-fadeup tc-fadeup-3"
          style={{
            position: "relative", zIndex: 1,
            textAlign: "center",
            padding: "20px 24px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            fontSize: 12,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          &copy; 2025 STUDI — Central Mindanao University Capstone Project
        </div>
      </div>
    </>
  )
}
