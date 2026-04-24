"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"

export default function EvaluatedQuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizForEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isEvaluator = sessionStorage.getItem("isEvaluator")
    if (!isEvaluator) {
      router.push("/evaluator/login")
      return
    }
    loadQuizzes()
  }, [router])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const data = await getQuizzesForEvaluation()
      setQuizzes(data.filter(q => q.evaluationStatus === "evaluated"))
    } catch (err) {
      setError("Failed to load quizzes")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    })

  const DIFF_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    easy:     { color: "#51CF66", bg: "rgba(81,207,102,0.12)",  border: "rgba(81,207,102,0.25)"  },
    moderate: { color: "#FFD43B", bg: "rgba(255,212,59,0.12)",  border: "rgba(255,212,59,0.25)"  },
    hard:     { color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", border: "rgba(255,107,107,0.25)" },
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .ev-eval * { box-sizing: border-box; }
        .ev-eval { font-family: 'DM Sans', sans-serif; }

        @keyframes evBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .ev-blob { animation: evBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        @keyframes evFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ev-grid-item { animation: evFadeUp .3s ease forwards; opacity: 0; }
        .ev-grid-item:nth-child(1) { animation-delay: .04s; }
        .ev-grid-item:nth-child(2) { animation-delay: .08s; }
        .ev-grid-item:nth-child(3) { animation-delay: .12s; }
        .ev-grid-item:nth-child(4) { animation-delay: .16s; }
        .ev-grid-item:nth-child(5) { animation-delay: .20s; }
        .ev-grid-item:nth-child(6) { animation-delay: .24s; }
        .ev-grid-item:nth-child(n+7) { animation-delay: .28s; }

        .ev-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 18px;
          cursor: pointer;
          transition: all .2s;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        .ev-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #51CF66, transparent);
          opacity: 0.5;
        }
        .ev-card:hover {
          border-color: rgba(81,207,102,0.3);
          background: rgba(81,207,102,0.05);
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.4);
        }
      `}</style>

      <div
        className="ev-eval"
        style={{
          display: "flex", height: "100vh", overflow: "hidden",
          background: "#07071a", color: "#fff", position: "relative",
        }}
      >
        <div className="ev-blob" style={{ width: 300, height: 300, background: "rgba(81,207,102,0.07)", top: -60, left: 220, animationDuration: "11s" }} />
        <div className="ev-blob" style={{ width: 240, height: 240, background: "rgba(91,110,232,0.07)", bottom: 40, right: 60, animationDuration: "15s", animationDelay: "5s" }} />

        <EvaluatorMobileHeader />
        <EvaluatorSidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }} className="pt-14 md:pt-0">

          {/* ── Top bar ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 10, gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>
                  <span>Evaluator</span><span>›</span>
                  <span style={{ color: "#51CF66", fontWeight: 600 }}>Evaluated</span>
                </div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>
                  Evaluated Quizzes
                </h1>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                display: "flex", alignItems: "baseline", gap: 6,
                background: "rgba(81,207,102,0.1)",
                border: "1px solid rgba(81,207,102,0.25)",
                borderRadius: 10, padding: "6px 14px",
              }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#51CF66", lineHeight: 1 }}>
                  {loading ? "—" : quizzes.length}
                </span>
                <span style={{ fontSize: 11, color: "rgba(81,207,102,0.6)", fontWeight: 600 }}>completed</span>
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

            {error && (
              <div style={{
                background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)",
                color: "#ff8f8f", borderRadius: 10, padding: "10px 14px",
                fontSize: 13, marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 18, height: 160 }}>
                    <div style={{ height: 8, width: 60, background: "rgba(255,255,255,0.06)", borderRadius: 100, marginBottom: 14 }} />
                    <div style={{ height: 12, background: "rgba(255,255,255,0.07)", borderRadius: 100, marginBottom: 8, width: "85%" }} />
                    <div style={{ height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 100, width: "55%" }} />
                  </div>
                ))}
              </div>

            ) : quizzes.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 360, gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                  🗂
                </div>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>No evaluated quizzes yet</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>Complete evaluations to see them here</p>
                </div>
                <button
                  suppressHydrationWarning
                  onClick={() => router.push("/evaluator/pending")}
                  style={{
                    padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    color: "#fff", background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                    border: "none", cursor: "pointer", fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(91,110,232,0.35)",
                  }}
                >
                  View Pending Quizzes
                </button>
              </div>

            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                {quizzes.map((quiz, i) => {
                  const diff = DIFF_CONFIG[quiz.difficulty] ?? DIFF_CONFIG.moderate
                  return (
                    <div
                      key={quiz.id}
                      className="ev-card ev-grid-item"
                      onClick={() => router.push(`/evaluator/view/${quiz.id}`)}
                    >
                      {/* Status + difficulty */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#51CF66" }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#51CF66", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                            Evaluated
                          </span>
                        </div>
                        <span style={{
                          fontSize: 9, fontWeight: 700, textTransform: "capitalize",
                          color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`,
                          borderRadius: 100, padding: "2px 8px",
                        }}>
                          {quiz.difficulty}
                        </span>
                      </div>

                      {/* Name */}
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {quiz.fileName}
                      </div>

                      {/* Meta */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M3 5h6M3 7.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                          </svg>
                          {quiz.questionCount} questions
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M6 3.5v3l2 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                          </svg>
                          {formatDate(quiz.createdAt)}
                        </span>
                      </div>

                      {/* CTA */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Click to view</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#51CF66" }}>
                          View Results
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Status bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "6px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)",
            fontSize: 11, color: "rgba(255,255,255,0.3)",
          }}>
            <span>{loading ? "Loading…" : `${quizzes.length} item${quizzes.length !== 1 ? "s" : ""}`}</span>
            <span style={{ color: "#51CF66" }}>● Completed</span>
          </div>
        </div>
      </div>
    </>
  )
}