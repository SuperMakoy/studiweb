"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"

type Difficulty = "easy" | "moderate" | "hard"
type FilterTab = "all" | "pending" | "evaluated"

const DIFF_CONFIG = {
  easy:     { color: "#51CF66", bg: "rgba(81,207,102,0.15)",  border: "rgba(81,207,102,0.3)"  },
  moderate: { color: "#FFD43B", bg: "rgba(255,212,59,0.15)",  border: "rgba(255,212,59,0.3)"  },
  hard:     { color: "#FF6B6B", bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.3)" },
}

export default function EvaluatorDashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState<QuizForEvaluation[]>([])
  const [filter, setFilter] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")
  const [stats, setStats] = useState({ total: 0, pending: 0, evaluated: 0 })

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>("moderate")
  const [questionCount, setQuestionCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showUploadPanel, setShowUploadPanel] = useState(false)

  useEffect(() => {
    const isEvaluator = sessionStorage.getItem("isEvaluator")
    if (!isEvaluator) { router.push("/evaluator/login"); return }
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const data = await getQuizzesForEvaluation()
      setQuizzes(data)
      setStats({
        total: data.length,
        pending: data.filter(q => q.evaluationStatus === "pending").length,
        evaluated: data.filter(q => q.evaluationStatus === "evaluated").length,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuizzes = quizzes.filter(q => {
    const matchesFilter =
      filter === "all" ? true :
      filter === "pending" ? q.evaluationStatus === "pending" :
      q.evaluationStatus === "evaluated"
    const matchesSearch = q.fileName.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ["text/plain","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!validTypes.includes(file.type)) { setGenerateError("Only TXT and DOC/DOCX files are supported"); return }
    if (file.size > 1 * 1024 * 1024) { setGenerateError("File size must be less than 1MB"); return }
    setUploadedFile(file)
    setGenerateError(null)
  }

  const handleGenerateQuiz = async () => {
    if (!uploadedFile) return
    setGenerating(true)
    setGenerateError(null)
    try {
      const content = await uploadedFile.text()
      const response = await fetch("/api/generate-quiz-from-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: `eval-${Date.now()}`, userId: "evaluator", fileName: uploadedFile.name, difficulty, length: questionCount, content }),
      })
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || "Failed to generate quiz") }
      router.push("/evaluator/quizzes")
    } catch (err: any) {
      setGenerateError(err.message || "Failed to generate quiz")
    } finally {
      setGenerating(false)
    }
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  const evaluatorName = typeof window !== "undefined" ? sessionStorage.getItem("evaluatorName") || "Evaluator" : "Evaluator"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .ev-db { font-family: 'DM Sans', sans-serif; }
        .ev-db * { box-sizing: border-box; }

        /* Finder toolbar buttons */
        .ev-tb-btn {
          padding: 5px 8px; border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.5);
          cursor: pointer; transition: all .15s;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 500;
        }
        .ev-tb-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
        .ev-tb-btn.active { background: rgba(91,110,232,0.2); border-color: rgba(91,110,232,0.4); color: #9baeff; }

        /* Folder cards */
        .ev-folder {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          transition: all .2s;
          display: flex; flex-direction: column; gap: 10px;
          position: relative; overflow: hidden;
        }
        .ev-folder:hover {
          background: rgba(91,110,232,0.08);
          border-color: rgba(91,110,232,0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }
        .ev-folder::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }

        /* Folder icon */
        .ev-folder-icon {
          width: 48px; height: 40px;
          border-radius: 6px 6px 5px 5px;
          position: relative; flex-shrink: 0;
        }
        .ev-folder-icon::before {
          content: '';
          position: absolute; top: -7px; left: 0;
          width: 18px; height: 8px;
          border-radius: 3px 3px 0 0;
        }

        /* Upload drop zone */
        .ev-dropzone {
          border: 1.5px dashed rgba(91,110,232,0.3);
          border-radius: 12px; padding: 20px;
          text-align: center; cursor: pointer;
          transition: all .2s;
          background: rgba(91,110,232,0.04);
        }
        .ev-dropzone:hover { border-color: rgba(91,110,232,0.6); background: rgba(91,110,232,0.08); }

        /* Search */
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

        @keyframes evFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ev-grid-item { animation: evFadeUp .3s ease forwards; }
        .ev-grid-item:nth-child(1) { animation-delay: .04s; opacity: 0; }
        .ev-grid-item:nth-child(2) { animation-delay: .08s; opacity: 0; }
        .ev-grid-item:nth-child(3) { animation-delay: .12s; opacity: 0; }
        .ev-grid-item:nth-child(4) { animation-delay: .16s; opacity: 0; }
        .ev-grid-item:nth-child(5) { animation-delay: .20s; opacity: 0; }
        .ev-grid-item:nth-child(6) { animation-delay: .24s; opacity: 0; }
        .ev-grid-item:nth-child(n+7) { animation-delay: .28s; opacity: 0; }

        @keyframes evBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .ev-blob { animation: evBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
      `}</style>

      <div className="ev-db" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>

        {/* Ambient blobs */}
        <div className="ev-blob" style={{ width: 300, height: 300, background: "rgba(91,110,232,0.09)", top: -60, left: 200, animationDuration: "11s" }} />
        <div className="ev-blob" style={{ width: 220, height: 220, background: "rgba(123,94,167,0.07)", bottom: 40, right: 60, animationDuration: "15s", animationDelay: "5s" }} />

        <EvaluatorMobileHeader />
        <EvaluatorSidebar />

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }} className="pt-14 md:pt-0">

          {/* ── Finder-style toolbar ── */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap",
          }}>
            {/* Back/forward (decorative, Finder-style) */}
            <div style={{ display: "flex", gap: 4, marginRight: 4 }}>
              {["‹", "›"].map((ch, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "rgba(255,255,255,0.2)", userSelect: "none",
                }}>{ch}</div>
              ))}
            </div>

            {/* Path breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.4)", flex: 1 }}>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>Evaluator</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
              <span style={{
                fontWeight: 600, color: "#fff",
                background: "rgba(91,110,232,0.15)",
                border: "1px solid rgba(91,110,232,0.2)",
                borderRadius: 6, padding: "2px 10px", fontSize: 12,
              }}>
                {filter === "all" ? "All Quizzes" : filter === "pending" ? "Pending" : "Evaluated"}
              </span>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["all", "pending", "evaluated"] as FilterTab[]).map((f) => (
                <button
                  key={f}
                  className={`ev-tb-btn${filter === f ? " active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : f === "pending" ? `Pending · ${stats.pending}` : `Done · ${stats.evaluated}`}
                </button>
              ))}
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

            {/* Generate button */}
            <button
              className="ev-tb-btn"
              onClick={() => setShowUploadPanel(p => !p)}
              style={showUploadPanel ? { background: "rgba(91,110,232,0.2)", borderColor: "rgba(91,110,232,0.4)", color: "#9baeff" } : {}}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Generate
            </button>
          </div>

          {/* ── Generate panel (collapsible) ── */}
          {showUploadPanel && (
            <div style={{
              background: "rgba(7,7,26,0.95)", backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "16px 20px",
              display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap",
            }}>
              {/* Drop zone */}
              <div
                className="ev-dropzone"
                style={{ minWidth: 200, flex: "1 1 200px" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept=".txt,.doc,.docx" onChange={handleFileSelect} style={{ display: "none" }} />
                <div style={{ fontSize: 22, marginBottom: 6 }}>📄</div>
                {uploadedFile ? (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#9baeff" }}>{uploadedFile.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Click to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>Drop file or click to browse</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>TXT, DOC, DOCX · max 1MB</div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Difficulty */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>Difficulty</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["easy","moderate","hard"] as Difficulty[]).map(d => (
                      <button
                        key={d}
                        suppressHydrationWarning
                        onClick={() => setDifficulty(d)}
                        style={{
                          flex: 1, padding: "6px 4px", borderRadius: 8,
                          fontSize: 12, fontWeight: 600,
                          border: `1px solid ${difficulty === d ? DIFF_CONFIG[d].border : "rgba(255,255,255,0.08)"}`,
                          background: difficulty === d ? DIFF_CONFIG[d].bg : "rgba(255,255,255,0.04)",
                          color: difficulty === d ? DIFF_CONFIG[d].color : "rgba(255,255,255,0.4)",
                          cursor: "pointer", transition: "all .15s",
                          fontFamily: "inherit", textTransform: "capitalize",
                        }}
                      >{d}</button>
                    ))}
                  </div>
                </div>

                {/* Questions slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>
                    <span>Questions</span>
                    <span style={{ color: "#7f9fff" }}>{questionCount}</span>
                  </div>
                  <input
                    suppressHydrationWarning
                    type="range" min="10" max="50" step="5"
                    value={questionCount}
                    onChange={e => setQuestionCount(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#5B6EE8" }}
                  />
                </div>

                {/* Error + Generate */}
                {generateError && (
                  <div style={{ fontSize: 12, color: "#FF6B6B", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 8, padding: "8px 12px" }}>
                    {generateError}
                  </div>
                )}
                <button
                  suppressHydrationWarning
                  onClick={handleGenerateQuiz}
                  disabled={!uploadedFile || generating}
                  style={{
                    padding: "9px 20px", borderRadius: 10,
                    background: uploadedFile ? "linear-gradient(135deg,#5B6EE8,#7b5ea7)" : "rgba(255,255,255,0.06)",
                    border: "none", color: uploadedFile ? "#fff" : "rgba(255,255,255,0.3)",
                    fontSize: 13, fontWeight: 700, cursor: uploadedFile ? "pointer" : "not-allowed",
                    fontFamily: "inherit", transition: "all .2s",
                    boxShadow: uploadedFile ? "0 4px 14px rgba(91,110,232,0.35)" : "none",
                  }}
                >
                  {generating ? "Generating…" : "✦ Generate Quiz"}
                </button>
              </div>
            </div>
          )}

          {/* ── Content area ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

            {loading ? (
              /* Skeleton grid */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, height: 140 }}>
                    <div style={{ width: 48, height: 40, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 12, animation: "evFadeUp 1.5s ease-in-out infinite alternate" }} />
                    <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 100, marginBottom: 8, width: "80%" }} />
                    <div style={{ height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 100, width: "50%" }} />
                  </div>
                ))}
              </div>

            ) : filteredQuizzes.length === 0 ? (
              /* Empty state */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
                <div style={{ fontSize: 40, opacity: 0.3 }}>🗂</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
                  {search ? `No quizzes matching "${search}"` : "No quizzes here yet"}
                </div>
              </div>

            ) : (
              /* Finder-style folder grid */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 14 }}>
                {filteredQuizzes.map((quiz, i) => {
                  const diff = DIFF_CONFIG[quiz.difficulty as keyof typeof DIFF_CONFIG] ?? DIFF_CONFIG.moderate
                  const isPending = quiz.evaluationStatus === "pending"
                  const dest = isPending ? `/evaluator/evaluate/${quiz.id}` : `/evaluator/view/${quiz.id}`

                  return (
                    <div
                      key={quiz.id}
                      className="ev-folder ev-grid-item"
                      onClick={() => router.push(dest)}
                    >
                      {/* Folder icon */}
                      <div style={{ position: "relative", width: 52, height: 44 }}>
                        {/* Folder tab */}
                        <div style={{
                          position: "absolute", top: -7, left: 0,
                          width: 20, height: 8,
                          borderRadius: "3px 3px 0 0",
                          background: diff.color,
                          opacity: 0.7,
                        }} />
                        {/* Folder body */}
                        <div style={{
                          position: "absolute", bottom: 0, left: 0,
                          width: 52, height: 40,
                          borderRadius: "3px 6px 5px 5px",
                          background: `linear-gradient(160deg, ${diff.color}30, ${diff.color}18)`,
                          border: `1px solid ${diff.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {/* Status dot */}
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: isPending ? "#FFD43B" : "#51CF66",
                            boxShadow: `0 0 6px ${isPending ? "#FFD43B" : "#51CF66"}`,
                          }} />
                        </div>
                      </div>

                      {/* Quiz name */}
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", lineHeight: 1.4, wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {quiz.fileName}
                      </div>

                      {/* Meta row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                          {quiz.questionCount}Q · {formatDate(quiz.createdAt)}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          color: diff.color, background: diff.bg,
                          border: `1px solid ${diff.border}`,
                          borderRadius: 100, padding: "2px 7px",
                          textTransform: "capitalize", letterSpacing: ".4px",
                        }}>
                          {quiz.difficulty}
                        </span>
                      </div>

                      {/* Status label */}
                      <div style={{
                        fontSize: 10, fontWeight: 600,
                        color: isPending ? "#FFD43B" : "#51CF66",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: isPending ? "#FFD43B" : "#51CF66" }} />
                        {isPending ? "Awaiting Review" : "Evaluated"}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Finder-style status bar ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "6px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)",
            fontSize: 11, color: "rgba(255,255,255,0.3)",
          }}>
            <span>{filteredQuizzes.length} item{filteredQuizzes.length !== 1 ? "s" : ""}</span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ color: "#FFD43B" }}>● {stats.pending} pending</span>
              <span style={{ color: "#51CF66" }}>● {stats.evaluated} evaluated</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}