"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"

export default function AllQuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizForEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

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
      setQuizzes(data)
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

  const filtered = search.trim()
    ? quizzes.filter(q => q.fileName.toLowerCase().includes(search.toLowerCase()))
    : quizzes

  const pendingCount = quizzes.filter(q => q.evaluationStatus === "pending").length
  const doneCount = quizzes.filter(q => q.evaluationStatus === "evaluated").length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .ev-all * { box-sizing: border-box; }
        .ev-all { font-family: 'DM Sans', sans-serif; }

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
        .ev-card:hover {
          border-color: rgba(91,110,232,0.3);
          background: rgba(91,110,232,0.06);
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.4);
        }

        .ev-search {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 6px 12px 6px 32px;
          color: #fff; font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none; width: 200px;
          transition: all .2s;
        }
        .ev-search::placeholder { color: rgba(255,255,255,0.25); }
        .ev-search:focus { border-color: rgba(91,110,232,0.5); background: rgba(91,110,232,0.07); width: 240px; }
      `}</style>

      <div
        className="ev-all"
        style={{
          display: "flex", height: "100vh", overflow: "hidden",
          background: "#07071a", color: "#fff", position: "relative",
        }}
      >
        <div className="ev-blob" style={{ width: 300, height: 300, background: "rgba(91,110,232,0.09)", top: -60, left: 220, animationDuration: "11s" }} />
        <div className="ev-blob" style={{ width: 220, height: 220, background: "rgba(123,94,167,0.07)", bottom: 40, right: 60, animationDuration: "15s", animationDelay: "5s" }} />

        <EvaluatorMobileHeader />
        <EvaluatorSidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }} className="pt-14 md:pt-0">

          {/* ── Top bar ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap", gap: 10,
          }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.4)", flex: 1 }}>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>Evaluator</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
              <span style={{
                fontWeight: 600, color: "#fff",
                background: "rgba(91,110,232,0.15)",
                border: "1px solid rgba(91,110,232,0.2)",
                borderRadius: 6, padding: "2px 10px", fontSize: 12,
              }}>
                All Quizzes
              </span>
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.35 }}>
                <circle cx="5.5" cy="5.5" r="4" stroke="#fff" strokeWidth="1.2" />
                <path d="M9 9l2.5 2.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                suppressHydrationWarning
                className="ev-search"
                placeholder="Search quizzes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#FFD43B", background: "rgba(255,212,59,0.1)", border: "1px solid rgba(255,212,59,0.2)", borderRadius: 100, padding: "4px 10px" }}>
                ● {pendingCount} pending
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#51CF66", background: "rgba(81,207,102,0.1)", border: "1px solid rgba(81,207,102,0.2)", borderRadius: 100, padding: "4px 10px" }}>
                ● {doneCount} done
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

            {error && (
              <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", color: "#ff8f8f", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 18, height: 160 }}>
                    <div style={{ height: 8, width: 60, background: "rgba(255,255,255,0.06)", borderRadius: 100, marginBottom: 14 }} />
                    <div style={{ height: 12, background: "rgba(255,255,255,0.07)", borderRadius: 100, marginBottom: 8, width: "85%" }} />
                    <div style={{ height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 100, width: "55%" }} />
                  </div>
                ))}
              </div>

            ) : filtered.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 12 }}>
                <div style={{ fontSize: 40, opacity: 0.3 }}>🗂</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
                  {search ? `No quizzes matching "${search}"` : "No quizzes yet"}
                </div>
                {!search && (
                  <button
                    suppressHydrationWarning
                    onClick={() => router.push("/evaluator/dashboard")}
                    style={{
                      padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                      color: "#fff", background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>

            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {filtered.map((quiz) => {
                  const diff = DIFF_CONFIG[quiz.difficulty] ?? DIFF_CONFIG.moderate
                  const isPending = quiz.evaluationStatus === "pending"
                  const dest = isPending ? `/evaluator/evaluate/${quiz.id}` : `/evaluator/view/${quiz.id}`
                  const statusColor = isPending ? "#FFD43B" : "#51CF66"

                  return (
                    <div
                      key={quiz.id}
                      className="ev-card ev-grid-item"
                      onClick={() => router.push(dest)}
                      style={{ borderTop: `2px solid ${statusColor}20` }}
                    >
                      {/* Status + difficulty */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, letterSpacing: "0.6px", textTransform: "uppercase" }}>
                            {isPending ? "Pending" : "Evaluated"}
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
                          {quiz.questionCount}Q
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
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Click to open</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: statusColor }}>
                          {isPending ? "Evaluate" : "View Results"}
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
            padding: "6px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)",
            fontSize: 11, color: "rgba(255,255,255,0.3)",
          }}>
            <span>{loading ? "Loading…" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}</span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ color: "#FFD43B" }}>● {pendingCount} pending</span>
              <span style={{ color: "#51CF66" }}>● {doneCount} evaluated</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}