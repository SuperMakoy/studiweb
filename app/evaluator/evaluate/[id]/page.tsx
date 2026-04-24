"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
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
  { key: "verbAlignment" as keyof RubricCriteria, label: "Verb Alignment", description: "Does the action verb match the cognitive level?", scoreDescriptions: { 1: "Completely misaligned", 2: "Mostly misaligned", 3: "Partially aligned", 4: "Mostly aligned", 5: "Perfect alignment" } },
  { key: "cognitiveComplexity" as keyof RubricCriteria, label: "Cognitive Complexity", description: "Does the question require the expected cognitive processing?", scoreDescriptions: { 1: "Wrong complexity", 2: "Too simple/complex", 3: "Moderate match", 4: "Good match", 5: "Exact match" } },
  { key: "questionClarity" as keyof RubricCriteria, label: "Question Clarity", description: "Is the question clearly written and unambiguous?", scoreDescriptions: { 1: "Very confusing", 2: "Somewhat unclear", 3: "Adequate clarity", 4: "Clear", 5: "Crystal clear" } },
  { key: "topicRelevance" as keyof RubricCriteria, label: "Topic Relevance", description: "Is the question relevant to the source content?", scoreDescriptions: { 1: "Not relevant", 2: "Barely relevant", 3: "Somewhat relevant", 4: "Relevant", 5: "Highly relevant" } },
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

  const handleRubricChange = (criterion: keyof RubricCriteria, score: number) => {
    setEvaluations(prev => {
      const cur = prev[currentQuestionIndex]
      const newScores = { ...cur.rubricScores, [criterion]: score }
      const overall = Math.round((newScores.verbAlignment + newScores.cognitiveComplexity + newScores.questionClarity + newScores.topicRelevance) / 4)
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
      setTimeout(() => setSaved(false), 3000)
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
          <button suppressHydrationWarning onClick={() => router.push("/evaluator/dashboard")} style={{ padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)", border: "none", cursor: "pointer" }}>
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
        .ev-nav-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .ev-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="ev-ev" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff" }}>
        <EvaluatorMobileHeader />
        <EvaluatorSidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} className="pt-14 md:pt-0">

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 10, gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button suppressHydrationWarning onClick={() => router.push("/evaluator/dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Dashboard
              </button>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quiz.fileName}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "capitalize" }}>{quiz.difficulty} difficulty</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Q {currentQuestionIndex + 1}/{quiz.questions.length}</span>
              <button
                suppressHydrationWarning
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8,
                  background: saved ? "rgba(81,207,102,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${saved ? "rgba(81,207,102,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: saved ? "#51CF66" : "rgba(255,255,255,0.6)",
                  cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                  transition: "all .2s",
                }}
              >
                {saved ? (
                  <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" /><path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>Saved</>
                ) : saving ? "Saving…" : (
                  <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10V6l4-4 4 4v4H7.5V8h-3v2H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>Save</>
                )}
              </button>
            </div>
          </div>

          {/* Main */}
          <main style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {error && (
              <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", color: "#ff8f8f", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, maxWidth: 1100 }}>

              {/* ── Left: Question ── */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px" }}>
                {/* Level badge */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    color: levelColor,
                    background: `${levelColor}18`,
                    border: `1px solid ${levelColor}30`,
                    borderRadius: 100, padding: "3px 10px",
                  }}>
                    AI: {currentQuestion.cognitiveLevel || "Not specified"}
                  </span>
                </div>

                {/* Question text */}
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 20px", lineHeight: 1.5 }}>
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {currentQuestion.options.map((option, idx) => {
                    const isCorrect = currentQuestion.correctAnswers.includes(idx)
                    return (
                      <div key={idx} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "11px 14px", borderRadius: 10,
                        background: isCorrect ? "rgba(81,207,102,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isCorrect ? "rgba(81,207,102,0.3)" : "rgba(255,255,255,0.07)"}`,
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                          background: isCorrect ? "#51CF66" : "rgba(255,255,255,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700,
                          color: isCorrect ? "#fff" : "rgba(255,255,255,0.4)",
                        }}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span style={{ fontSize: 13, color: isCorrect ? "#a3f0b8" : "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{option}</span>
                      </div>
                    )
                  })}
                </div>
                {currentQuestion.correctAnswers.length > 0 && (
                  <p style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    Correct: {currentQuestion.correctAnswers.map(i => String.fromCharCode(65 + i)).join(", ")}
                  </p>
                )}
              </div>

              {/* ── Right: Rubric ── */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Evaluation Rubric</h3>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Rate 1–5</span>
                </div>

                {/* 4 rubric criteria */}
                {RUBRIC_CRITERIA.map(criterion => (
                  <div key={criterion.key} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{criterion.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{criterion.description}</div>
                      </div>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#5B6EE8" }}>
                        {currentEval?.rubricScores?.[criterion.key] || 3}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[1,2,3,4,5].map(score => {
                        const active = currentEval?.rubricScores?.[criterion.key] === score
                        return (
                          <button
                            key={score}
                            suppressHydrationWarning
                            className="ev-score-btn"
                            onClick={() => handleRubricChange(criterion.key, score)}
                            style={{
                              flex: 1, padding: "8px 4px", borderRadius: 8,
                              fontSize: 13, fontWeight: 600,
                              border: active ? "1px solid rgba(91,110,232,0.5)" : "1px solid rgba(255,255,255,0.1)",
                              background: active ? "rgba(91,110,232,0.2)" : "rgba(255,255,255,0.04)",
                              color: active ? "#9baeff" : "rgba(255,255,255,0.45)",
                            }}
                          >
                            {score}
                          </button>
                        )
                      })}
                    </div>
                    <p style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                      {criterion.scoreDescriptions[currentEval?.rubricScores?.[criterion.key] as 1|2|3|4|5 || 3]}
                    </p>
                  </div>
                ))}

                {/* Overall score */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(91,110,232,0.1)", border: "1px solid rgba(91,110,232,0.2)", borderRadius: 12, padding: "14px 18px" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#9baeff" }}>Overall Alignment</div>
                    <div style={{ fontSize: 11, color: "rgba(155,174,255,0.5)", marginTop: 2 }}>Average of all criteria</div>
                  </div>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#5B6EE8" }}>
                    {currentEval?.alignmentScore || 3}/5
                  </span>
                </div>

                {/* Suggested level */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>Your Suggested Level</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
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
                            border: active ? `1px solid ${c}50` : "1px solid rgba(255,255,255,0.08)",
                            background: active ? `${c}18` : "rgba(255,255,255,0.03)",
                            color: active ? c : "rgba(255,255,255,0.45)",
                          }}
                        >
                          {level}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>Evaluator Notes</div>
                  <textarea
                    value={currentEval?.notes || ""}
                    onChange={e => handleNotesChange(e.target.value)}
                    placeholder="Add comments, suggestions, or observations…"
                    rows={3}
                    style={{
                      width: "100%", resize: "none",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10, padding: "10px 12px",
                      color: "#fff", fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none", lineHeight: 1.6,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
              <button
                suppressHydrationWarning
                className="ev-nav-btn"
                onClick={() => setCurrentQuestionIndex(p => p - 1)}
                disabled={currentQuestionIndex === 0}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Previous
              </button>

              {/* Dots */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center", maxWidth: 300 }}>
                {quiz.questions.map((_, idx) => {
                  const hasEval = evaluations[idx]?.notes || evaluations[idx]?.alignmentScore !== 3 || evaluations[idx]?.suggestedLevel !== quiz.questions[idx].cognitiveLevel
                  return (
                    <button
                      key={idx}
                      suppressHydrationWarning
                      onClick={() => setCurrentQuestionIndex(idx)}
                      style={{
                        width: 28, height: 28, borderRadius: "50%",
                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                        border: "none",
                        background: idx === currentQuestionIndex ? "#5B6EE8" : hasEval ? "rgba(81,207,102,0.2)" : "rgba(255,255,255,0.08)",
                        color: idx === currentQuestionIndex ? "#fff" : hasEval ? "#51CF66" : "rgba(255,255,255,0.4)",
                        fontFamily: "inherit",
                        transition: "all .15s",
                      }}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              {isLast ? (
                <button
                  suppressHydrationWarning
                  className="ev-nav-btn"
                  onClick={handleFinish}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#51CF66,#37b24d)", border: "none", boxShadow: "0 4px 14px rgba(81,207,102,0.3)" }}
                >
                  Finish & Save
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" /><path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              ) : (
                <button
                  suppressHydrationWarning
                  className="ev-nav-btn"
                  onClick={() => setCurrentQuestionIndex(p => p + 1)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)", border: "none", boxShadow: "0 4px 14px rgba(91,110,232,0.3)" }}
                >
                  Next
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}