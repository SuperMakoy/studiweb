"use client"

import { useEffect, useState, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"
import {
  getQuizForEvaluation,
  saveEvaluation,
  type QuizForEvaluation,
  type QuestionEvaluation,
  type RubricCriteria,
} from "@/lib/evaluation-service"

type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

const COGNITIVE_LEVELS: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

const LEVEL_COLORS: Record<CognitiveLevel, string> = {
  Remember: "#7f9fff", Understand: "#5dade2", Apply: "#58d68d",
  Analyze: "#f8c471", Evaluate: "#eb984e", Create: "#f1948a",
}

const RUBRIC_CRITERIA = [
  {
    key: "verbAlignment" as keyof RubricCriteria,
    label: "Verb Alignment",
    description: "Does the action verb match the cognitive level?",
    scoreDescriptions: { 1: "Completely misaligned", 2: "Mostly misaligned", 3: "Partially aligned", 4: "Mostly aligned", 5: "Perfect alignment" },
  },
  {
    key: "cognitiveComplexity" as keyof RubricCriteria,
    label: "Cognitive Complexity",
    description: "Does the question require the expected cognitive processing?",
    scoreDescriptions: { 1: "Wrong complexity", 2: "Too simple/complex", 3: "Moderate match", 4: "Good match", 5: "Exact match" },
  },
  {
    key: "questionClarity" as keyof RubricCriteria,
    label: "Question Clarity",
    description: "Is the question clearly written and unambiguous?",
    scoreDescriptions: { 1: "Very confusing", 2: "Somewhat unclear", 3: "Adequate clarity", 4: "Clear", 5: "Crystal clear" },
  },
  {
    key: "topicRelevance" as keyof RubricCriteria,
    label: "Topic Relevance",
    description: "Is the question relevant to the source content?",
    scoreDescriptions: { 1: "Not relevant", 2: "Barely relevant", 3: "Somewhat relevant", 4: "Relevant", 5: "Highly relevant" },
  },
]

export default function EvaluatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [quiz, setQuiz] = useState<QuizForEvaluation | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [evaluations, setEvaluations] = useState<Record<number, QuestionEvaluation>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isEvaluator = sessionStorage.getItem("isEvaluator")
    if (!isEvaluator) { router.push("/evaluator/login"); return }
    loadQuiz()
  }, [id, router])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const data = await getQuizForEvaluation(id)
      if (data) {
        setQuiz(data)
        const init: Record<number, QuestionEvaluation> = {}
        data.questions.forEach((q, index) => {
          init[index] = {
            questionId: q.id,
            rubricScores: { verbAlignment: 3, cognitiveComplexity: 3, questionClarity: 3, topicRelevance: 3 },
            alignmentScore: 3,
            suggestedLevel: q.cognitiveLevel || "Remember",
            notes: "",
          }
        })
        setEvaluations(init)
      }
    } catch (err) { setError("Failed to load quiz"); console.error(err) }
    finally { setLoading(false) }
  }

  const goNext = useCallback(() => {
    if (!quiz) return
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(p => p + 1)
    }
  }, [currentQuestionIndex, quiz])

  const goPrev = useCallback(() => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(p => p - 1)
  }, [currentQuestionIndex])

  // ── Keyboard navigation ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in textarea
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [goNext, goPrev])

  const handleRubricChange = (criterion: keyof RubricCriteria, score: number) => {
    setEvaluations(prev => {
      const cur = prev[currentQuestionIndex]
      const newScores = { ...cur.rubricScores, [criterion]: score }
      const overall = Math.round(
        (newScores.verbAlignment + newScores.cognitiveComplexity + newScores.questionClarity + newScores.topicRelevance) / 4
      )
      return { ...prev, [currentQuestionIndex]: { ...cur, rubricScores: newScores, alignmentScore: overall } }
    })
  }

  const handleLevelChange = (level: CognitiveLevel) => {
    setEvaluations(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], suggestedLevel: level } }))
  }

  const handleNotesChange = (notes: string) => {
    setEvaluations(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], notes } }))
  }

  const handleSave = async () => {
    if (!quiz) return
    try {
      setSaving(true)
      const evaluatorName = sessionStorage.getItem("evaluatorName") || "Unknown"
      await saveEvaluation(id, Object.values(evaluations), evaluatorName)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) { setError("Failed to save evaluation"); console.error(err) }
    finally { setSaving(false) }
  }

  const handleFinish = async () => { await handleSave(); router.push("/evaluator/dashboard") }

  if (loading) return (
    <div className="md:flex h-screen" style={{ background: "#07071a" }}>
      <EvaluatorMobileHeader /><EvaluatorSidebar />
      <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ animation: "spin 0.9s linear infinite" }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <circle cx="18" cy="18" r="15" stroke="rgba(91,110,232,0.2)" strokeWidth="2" />
            <path d="M18 3A15 15 0 0133 18" stroke="#5B6EE8" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>Loading quiz…</span>
        </div>
      </div>
    </div>
  )

  if (!quiz) return (
    <div className="md:flex h-screen" style={{ background: "#07071a" }}>
      <EvaluatorMobileHeader /><EvaluatorSidebar />
      <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
        <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Quiz not found</p>
          <button suppressHydrationWarning onClick={() => router.push("/evaluator/dashboard")}
            style={{ padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)", border: "none", cursor: "pointer" }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const currentEval = evaluations[currentQuestionIndex]
  const isLast = currentQuestionIndex === quiz.questions.length - 1
  const levelColor = currentQuestion.cognitiveLevel ? LEVEL_COLORS[currentQuestion.cognitiveLevel as CognitiveLevel] : "#7f9fff"
  const progressPct = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .ev-ev * { box-sizing: border-box; }
        .ev-ev { font-family: 'DM Sans', sans-serif; }
        .ev-score-btn { transition: all .15s; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ev-score-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .ev-level-btn { transition: all .15s; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ev-level-btn:hover { opacity: 0.85; }
        .ev-nav-btn { transition: all .2s; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ev-nav-btn:hover:not(:disabled) { opacity: 0.85; }
        .ev-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .ev-dot-btn { transition: all .15s; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ev-dot-btn:hover { transform: scale(1.1); }

        /* Panels use fixed height with independent scroll */
        .ev-panel-scroll {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .ev-panel-scroll::-webkit-scrollbar { width: 4px; }
        .ev-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .ev-panel-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        @keyframes evFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ev-question-anim { animation: evFadeIn .2s ease forwards; }

        /* Keyboard hint pulse */
        @keyframes kbPulse {
          0%,100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .ev-kb-hint { animation: kbPulse 3s ease-in-out infinite; }
      `}</style>

      <div className="ev-ev" style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#07071a",
        color: "#fff",
      }}>
        <EvaluatorMobileHeader />
        <EvaluatorSidebar />

        {/* Main — full height, no scroll on outer */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} className="pt-14 md:pt-0">

          {/* ── Top bar (fixed) ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.95)", backdropFilter: "blur(12px)",
            flexShrink: 0, gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button suppressHydrationWarning onClick={() => router.push("/evaluator/dashboard")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Dashboard
              </button>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quiz.fileName}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "capitalize" }}>{quiz.difficulty} Difficulty</div>
              </div>
            </div>

            {/* Progress bar + Q counter */}
            <div style={{ flex: 1, maxWidth: 280, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                <span>Q {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg,#5B6EE8,#9b7fe8)", borderRadius: 100, transition: "width .4s ease" }} />
              </div>
            </div>

            {/* Save button */}
            <button suppressHydrationWarning onClick={handleSave} disabled={saving}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8,
                background: saved ? "rgba(81,207,102,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${saved ? "rgba(81,207,102,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: saved ? "#51CF66" : "rgba(255,255,255,0.6)",
                cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", transition: "all .2s",
              }}>
              {saved ? (
                <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" /><path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>Saved!</>
              ) : saving ? "Saving…" : (
                <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10V6l4-4 4 4v4H7.5V8h-3v2H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>Save</>
              )}
            </button>
          </div>

          {/* ── Two-panel body (fills remaining height) ── */}
          <div style={{ flex: 1, display: "flex", gap: 0, overflow: "hidden", minHeight: 0 }}>

            {/* LEFT: Question panel */}
            <div
              className="ev-panel-scroll ev-question-anim"
              key={currentQuestionIndex}
              style={{
                flex: "0 0 48%",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* AI level badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase",
                  color: levelColor, background: `${levelColor}18`, border: `1px solid ${levelColor}30`,
                  borderRadius: 100, padding: "3px 10px",
                }}>
                  AI: {currentQuestion.cognitiveLevel || "Not specified"}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>#{currentQuestion.id}</span>
              </div>

              {/* Question text */}
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "18px",
              }}>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.55, margin: 0 }}>
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {currentQuestion.options.map((option, idx) => {
                  const isCorrect = currentQuestion.correctAnswers.includes(idx)
                  return (
                    <div key={idx} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 13px", borderRadius: 10,
                      background: isCorrect ? "rgba(81,207,102,0.07)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isCorrect ? "rgba(81,207,102,0.25)" : "rgba(255,255,255,0.06)"}`,
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                        background: isCorrect ? "#51CF66" : "rgba(255,255,255,0.07)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 800,
                        color: isCorrect ? "#fff" : "rgba(255,255,255,0.35)",
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span style={{ fontSize: 12, color: isCorrect ? "#a3f0b8" : "rgba(255,255,255,0.55)", lineHeight: 1.55, flex: 1 }}>
                        {option}
                      </span>
                      {isCorrect && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                          <circle cx="7" cy="7" r="6" fill="rgba(81,207,102,0.2)" />
                          <path d="M4 7l2 2 4-4" stroke="#51CF66" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Keyboard hint */}
              <div className="ev-kb-hint" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {["←", "→"].map(k => (
                    <kbd key={k} style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 22, height: 20, borderRadius: 5,
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "monospace",
                    }}>{k}</kbd>
                  ))}
                </div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Navigate questions with arrow keys</span>
              </div>
            </div>

            {/* RIGHT: Rubric panel */}
            <div
              className="ev-panel-scroll"
              style={{
                flex: 1,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>
                  Evaluation Rubric
                </h3>
                {/* Overall score pill */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(91,110,232,0.12)", border: "1px solid rgba(91,110,232,0.25)",
                  borderRadius: 100, padding: "4px 14px",
                }}>
                  <span style={{ fontSize: 11, color: "#9baeff", fontWeight: 600 }}>Overall</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#5B6EE8" }}>
                    {currentEval?.alignmentScore || 3}/5
                  </span>
                </div>
              </div>

              {/* Rubric criteria — compact horizontal layout */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                {RUBRIC_CRITERIA.map(criterion => {
                  const currentScore = currentEval?.rubricScores?.[criterion.key] || 3
                  return (
                    <div key={criterion.key} style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 12, padding: "12px 14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{criterion.label}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{criterion.description}</div>
                        </div>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#5B6EE8", flexShrink: 0, marginLeft: 8 }}>
                          {currentScore}
                        </span>
                      </div>
                      {/* Score buttons */}
                      <div style={{ display: "flex", gap: 5 }}>
                        {[1, 2, 3, 4, 5].map(score => {
                          const active = currentScore === score
                          return (
                            <button
                              key={score}
                              suppressHydrationWarning
                              className="ev-score-btn"
                              onClick={() => handleRubricChange(criterion.key, score)}
                              style={{
                                flex: 1, padding: "7px 4px", borderRadius: 7,
                                fontSize: 12, fontWeight: 600,
                                border: active ? "1px solid rgba(91,110,232,0.5)" : "1px solid rgba(255,255,255,0.08)",
                                background: active ? "rgba(91,110,232,0.22)" : "rgba(255,255,255,0.03)",
                                color: active ? "#9baeff" : "rgba(255,255,255,0.4)",
                              }}
                            >
                              {score}
                            </button>
                          )
                        })}
                      </div>
                      <p style={{ marginTop: 5, fontSize: 10, color: "rgba(255,255,255,0.22)", textAlign: "center" }}>
                        {criterion.scoreDescriptions[currentScore as 1 | 2 | 3 | 4 | 5]}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Suggested level */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Your Suggested Level
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
                  {COGNITIVE_LEVELS.map(level => {
                    const active = currentEval?.suggestedLevel === level
                    const c = LEVEL_COLORS[level]
                    return (
                      <button
                        key={level}
                        suppressHydrationWarning
                        className="ev-level-btn"
                        onClick={() => handleLevelChange(level)}
                        style={{
                          padding: "7px 4px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                          border: active ? `1px solid ${c}50` : "1px solid rgba(255,255,255,0.07)",
                          background: active ? `${c}18` : "rgba(255,255,255,0.03)",
                          color: active ? c : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {level}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes — compact */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Notes <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 400, textTransform: "none" }}>(optional)</span>
                </div>
                <textarea
                  value={currentEval?.notes || ""}
                  onChange={e => handleNotesChange(e.target.value)}
                  placeholder="Add comments, suggestions, or observations…"
                  style={{
                    flex: 1, minHeight: 60, maxHeight: 100, resize: "none",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif", outline: "none", lineHeight: 1.6,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Bottom nav bar (always visible, fixed at bottom) ── */}
          <div style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.95)",
            backdropFilter: "blur(12px)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}>
            {/* Prev */}
            <button
              suppressHydrationWarning
              className="ev-nav-btn"
              onClick={goPrev}
              disabled={currentQuestionIndex === 0}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 10,
                fontSize: 13, fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                minWidth: 100,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Previous
            </button>

            {/* Question dots — scrollable if many */}
            <div style={{ display: "flex", gap: 5, overflowX: "auto", padding: "2px 0", maxWidth: 400, flexShrink: 1 }}>
              {quiz.questions.map((_, idx) => {
                const isCurrent = idx === currentQuestionIndex
                const isEvaluated = evaluations[idx]?.notes
                  || evaluations[idx]?.alignmentScore !== 3
                  || evaluations[idx]?.suggestedLevel !== quiz.questions[idx].cognitiveLevel
                return (
                  <button
                    key={idx}
                    suppressHydrationWarning
                    className="ev-dot-btn"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    style={{
                      width: isCurrent ? 32 : 26,
                      height: 26, borderRadius: isCurrent ? 8 : "50%",
                      fontSize: 10, fontWeight: 700, cursor: "pointer",
                      border: "none", flexShrink: 0,
                      background: isCurrent
                        ? "#5B6EE8"
                        : isEvaluated
                        ? "rgba(81,207,102,0.2)"
                        : "rgba(255,255,255,0.07)",
                      color: isCurrent ? "#fff" : isEvaluated ? "#51CF66" : "rgba(255,255,255,0.4)",
                      fontFamily: "inherit",
                      transition: "all .2s",
                    }}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            {/* Next / Finish */}
            {isLast ? (
              <button
                suppressHydrationWarning
                className="ev-nav-btn"
                onClick={handleFinish}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 18px", borderRadius: 10,
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  background: "linear-gradient(135deg,#51CF66,#37b24d)",
                  border: "none", boxShadow: "0 4px 14px rgba(81,207,102,0.3)",
                  minWidth: 120,
                }}
              >
                Finish & Save
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" /><path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            ) : (
              <button
                suppressHydrationWarning
                className="ev-nav-btn"
                onClick={goNext}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 18px", borderRadius: 10,
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                  border: "none", boxShadow: "0 4px 14px rgba(91,110,232,0.3)",
                  minWidth: 100,
                }}
              >
                Next
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}