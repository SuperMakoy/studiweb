"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getQuizzesForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"

export default function EvaluatorProfilePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ total: 0, pending: 0, evaluated: 0 })
  const [loadingStats, setLoadingStats] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalName, setOriginalName] = useState("")
  const [originalEmail, setOriginalEmail] = useState("")

  useEffect(() => {
    const isEvaluator = sessionStorage.getItem("isEvaluator")
    if (!isEvaluator) {
      router.push("/evaluator/login")
      return
    }

    const savedName = sessionStorage.getItem("evaluatorName") || "Evaluator"
    const savedEmail = sessionStorage.getItem("evaluatorEmail") || "evaluator@studi.com"
    setName(savedName)
    setEmail(savedEmail)
    setOriginalName(savedName)
    setOriginalEmail(savedEmail)

    getQuizzesForEvaluation()
      .then((quizzes) => {
        setStats({
          total: quizzes.length,
          pending: quizzes.filter((q) => q.evaluationStatus === "pending").length,
          evaluated: quizzes.filter((q) => q.evaluationStatus === "evaluated").length,
        })
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false))
  }, [router])

  const handleNameChange = (v: string) => {
    setName(v)
    setHasChanges(v !== originalName || email !== originalEmail)
    setSaved(false)
  }

  const handleEmailChange = (v: string) => {
    setEmail(v)
    setHasChanges(name !== originalName || v !== originalEmail)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 480))
    sessionStorage.setItem("evaluatorName", name.trim())
    sessionStorage.setItem("evaluatorEmail", email.trim())
    setOriginalName(name.trim())
    setOriginalEmail(email.trim())
    setHasChanges(false)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2800)
  }

  const completionRate =
    stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "EV"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .evp * { box-sizing: border-box; }
        .evp { font-family: 'DM Sans', sans-serif; }

        @keyframes evpBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .evp-blob { animation: evpBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        @keyframes evpFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .evp-fadeup { animation: evpFadeUp .35s ease forwards; }
        .evp-fadeup-1 { animation-delay: .05s; opacity: 0; }
        .evp-fadeup-2 { animation-delay: .12s; opacity: 0; }
        .evp-fadeup-3 { animation-delay: .20s; opacity: 0; }

        .evp-inp {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all .2s;
        }
        .evp-inp:focus {
          border-color: #5B6EE8;
          background: rgba(91,110,232,0.08);
          box-shadow: 0 0 0 3px rgba(91,110,232,0.15);
        }
        .evp-inp::placeholder { color: rgba(255,255,255,0.22); }
        .evp-inp:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255,255,255,0.03);
        }

        .evp-save-btn {
          padding: 11px 24px;
          border-radius: 10px;
          border: none;
          font-size: 14px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .evp-save-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .evp-save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .evp-stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 16px 20px;
          transition: border-color .2s, transform .2s;
        }
        .evp-stat-card:hover { border-color: rgba(91,110,232,0.25); transform: translateY(-1px); }

        @keyframes evpXp { from { width: 0; } }
        .evp-xp-fill { animation: evpXp .9s ease-out .4s both; }

        @keyframes evpSpin { to { transform: rotate(360deg); } }
        .evp-spin { animation: evpSpin .8s linear infinite; }
      `}</style>

      <div
        className="evp"
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: "#07071a",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Ambient blobs */}
        <div className="evp-blob" style={{ width: 320, height: 320, background: "rgba(91,110,232,0.09)", top: -60, left: 200, animationDuration: "11s" }} />
        <div className="evp-blob" style={{ width: 220, height: 220, background: "rgba(123,94,167,0.07)", bottom: 40, right: 60, animationDuration: "15s", animationDelay: "5s" }} />

        <EvaluatorMobileHeader />
        <EvaluatorSidebar />

        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}
          className="pt-14 md:pt-0"
        >
          {/* Top bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                <span>Evaluator</span>
                <span>›</span>
                <span style={{ color: "#9baeff", fontWeight: 600 }}>Profile</span>
              </div>
            </div>

            {/* Unsaved indicator */}
            {hasChanges && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 11, fontWeight: 600,
                color: "#FFD43B",
                background: "rgba(255,212,59,0.08)",
                border: "1px solid rgba(255,212,59,0.2)",
                borderRadius: 100, padding: "4px 12px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD43B" }} />
                Unsaved changes
              </div>
            )}
          </div>

          {/* Main content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>

              {/* ── Profile hero ── */}
              <div
                className="evp-fadeup evp-fadeup-1"
                style={{
                  background: "linear-gradient(135deg, rgba(91,110,232,0.18) 0%, rgba(91,110,232,0.06) 100%)",
                  border: "1px solid rgba(91,110,232,0.22)",
                  borderRadius: 20,
                  padding: "28px 28px 24px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  flexWrap: "wrap",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative corner glow */}
                <div style={{
                  position: "absolute", top: -40, right: -40,
                  width: 120, height: 120, borderRadius: "50%",
                  background: "rgba(91,110,232,0.15)", filter: "blur(30px)",
                  pointerEvents: "none",
                }} />

                {/* Avatar */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff",
                  flexShrink: 0,
                  boxShadow: "0 0 0 4px rgba(91,110,232,0.25)",
                }}>
                  {initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                    color: "#9baeff", background: "rgba(91,110,232,0.15)",
                    border: "1px solid rgba(91,110,232,0.25)", borderRadius: 100,
                    padding: "3px 10px", marginBottom: 8,
                  }}>
                    Taxonomy Expert
                  </div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: -0.5 }}>
                    {name || "Evaluator"}
                  </h1>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>{email || "evaluator@studi.com"}</p>
                </div>

                {/* Completion rate */}
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: completionRate >= 75 ? "#51CF66" : completionRate >= 40 ? "#FFD43B" : "#9baeff", lineHeight: 1 }}>
                    {loadingStats ? "—" : `${completionRate}%`}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>completion rate</div>
                </div>
              </div>

              {/* ── Stats row ── */}
              <div
                className="evp-fadeup evp-fadeup-1"
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}
              >
                {[
                  { label: "Total Quizzes", value: stats.total, icon: "📋", color: "#9baeff", bg: "rgba(91,110,232,0.1)", border: "rgba(91,110,232,0.2)" },
                  { label: "Evaluated",      value: stats.evaluated, icon: "✅", color: "#51CF66", bg: "rgba(81,207,102,0.1)", border: "rgba(81,207,102,0.2)" },
                  { label: "Pending",        value: stats.pending,   icon: "⏳", color: "#FFD43B", bg: "rgba(255,212,59,0.1)", border: "rgba(255,212,59,0.2)" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="evp-stat-card"
                    style={{ borderTop: `2px solid ${s.color}30` }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: loadingStats ? "rgba(255,255,255,0.2)" : s.color, lineHeight: 1 }}>
                      {loadingStats ? "—" : s.value}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.label}</div>

                    {/* Mini progress bar for evaluated/total */}
                    {s.label === "Evaluated" && !loadingStats && stats.total > 0 && (
                      <div style={{ marginTop: 10, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
                        <div
                          className="evp-xp-fill"
                          style={{
                            height: "100%",
                            width: `${completionRate}%`,
                            background: "#51CF66",
                            borderRadius: 100,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Edit form ── */}
              <div
                className="evp-fadeup evp-fadeup-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18,
                  padding: "24px",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)", margin: "0 0 20px" }}>
                  Profile Information
                </h2>

                {/* Display Name */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 700,
                    color: "rgba(255,255,255,0.4)", letterSpacing: "0.9px",
                    textTransform: "uppercase", marginBottom: 7,
                  }}>
                    Display Name
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name"
                    className="evp-inp"
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 700,
                    color: "rgba(255,255,255,0.4)", letterSpacing: "0.9px",
                    textTransform: "uppercase", marginBottom: 7,
                  }}>
                    Email Address
                  </label>
                  <input
                    suppressHydrationWarning
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="your@email.com"
                    className="evp-inp"
                  />
                </div>

                {/* Role — read-only */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 700,
                    color: "rgba(255,255,255,0.4)", letterSpacing: "0.9px",
                    textTransform: "uppercase", marginBottom: 7,
                  }}>
                    Role
                  </label>
                  <div style={{
                    padding: "11px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#5B6EE8", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Taxonomy Evaluator</span>
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 700,
                      color: "rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.05)", borderRadius: 100,
                      padding: "2px 8px", letterSpacing: "0.5px", textTransform: "uppercase",
                    }}>read-only</span>
                  </div>
                </div>

                {/* Save button */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    suppressHydrationWarning
                    className="evp-save-btn"
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    style={{
                      background: saved
                        ? "rgba(81,207,102,0.15)"
                        : hasChanges
                        ? "linear-gradient(135deg,#5B6EE8,#7b5ea7)"
                        : "rgba(255,255,255,0.07)",
                      border: saved
                        ? "1px solid rgba(81,207,102,0.35)"
                        : hasChanges
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                      color: saved ? "#51CF66" : hasChanges ? "#fff" : "rgba(255,255,255,0.3)",
                      boxShadow: hasChanges && !saved ? "0 4px 14px rgba(91,110,232,0.3)" : "none",
                    }}
                  >
                    {saving ? (
                      <>
                        <svg className="evp-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                          <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Saving…
                      </>
                    ) : saved ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M4.5 7l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Saved!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M4.5 2v3h5V2M4.5 8h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>

                  {saved && (
                    <span style={{ fontSize: 12, color: "rgba(81,207,102,0.7)" }}>
                      Your profile has been updated.
                    </span>
                  )}
                </div>
              </div>

              {/* ── About role card ── */}
              <div
                className="evp-fadeup evp-fadeup-3"
                style={{
                  background: "rgba(91,110,232,0.05)",
                  border: "1px solid rgba(91,110,232,0.15)",
                  borderRadius: 16,
                  padding: "18px 22px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(91,110,232,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="#9baeff" strokeWidth="1.3" />
                    <path d="M8 5.5v3M8 10.5v.5" stroke="#9baeff" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                    About the Evaluator Role
                  </h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>
                    As a Taxonomy Evaluator, you review AI-generated quiz questions and assess their alignment with Anderson &amp; Krathwohl&apos;s Revised Bloom&apos;s Taxonomy using a four-criteria rubric: verb alignment, cognitive complexity, question clarity, and topic relevance. Your assessments directly improve the quality of educational content.
                  </p>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  )
}