"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"
import {
  getQuizForEvaluation,
  getEvaluation,
  type QuizForEvaluation,
  type SavedEvaluation,
  type RubricCriteria,
} from "@/lib/evaluation-service"
import { ArrowLeft, FileText, Clock, CheckCircle2, AlertTriangle, BarChart3 } from "lucide-react"

type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

const COGNITIVE_LEVELS: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

const LEVEL_COLORS: Record<CognitiveLevel, string> = {
  Remember: "#7f9fff", Understand: "#5dade2", Apply: "#58d68d",
  Analyze: "#f8c471", Evaluate: "#eb984e", Create: "#f1948a",
}

const RUBRIC_LABELS: Record<keyof RubricCriteria, string> = {
  verbAlignment: "Verb Alignment",
  cognitiveComplexity: "Cognitive Complexity",
  questionClarity: "Question Clarity",
  topicRelevance: "Topic Relevance",
}

export default function EvaluationViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [quiz, setQuiz] = useState<QuizForEvaluation | null>(null)
  const [evaluation, setEvaluation] = useState<SavedEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)

  useEffect(() => {
    const isEvaluator = sessionStorage.getItem("isEvaluator")
    if (!isEvaluator) { router.push("/evaluator/login"); return }
    loadData()
  }, [id, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [quizData, evalData] = await Promise.all([getQuizForEvaluation(id), getEvaluation(id)])
      setQuiz(quizData)
      setEvaluation(evalData)
    } catch (err) { setError("Failed to load evaluation data"); console.error(err) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="md:flex h-screen" style={{ background: "#07071a" }}>
      <EvaluatorMobileHeader /><EvaluatorSidebar />
      <div className="flex-1 flex items-center justify-center pt-14 md:pt-0" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
        Loading evaluation…
      </div>
    </div>
  )

  if (!quiz || !evaluation) return (
    <div className="md:flex h-screen" style={{ background: "#07071a" }}>
      <EvaluatorMobileHeader /><EvaluatorSidebar />
      <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
        <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Evaluation not found</p>
          <button suppressHydrationWarning onClick={() => router.push("/evaluator/dashboard")}
            style={{ padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)", border: "none", cursor: "pointer" }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )

  // ── Stats calculation ──
  const totalQuestions = evaluation.questionEvaluations.length
  const rubricAverages: Record<keyof RubricCriteria, number> = {
    verbAlignment: 0, cognitiveComplexity: 0, questionClarity: 0, topicRelevance: 0,
  }
  let overallSum = 0, levelMatchCount = 0

  evaluation.questionEvaluations.forEach((qe, index) => {
    const question = quiz.questions[index]
    if (qe.rubricScores) {
      rubricAverages.verbAlignment += qe.rubricScores.verbAlignment || 0
      rubricAverages.cognitiveComplexity += qe.rubricScores.cognitiveComplexity || 0
      rubricAverages.questionClarity += qe.rubricScores.questionClarity || 0
      rubricAverages.topicRelevance += qe.rubricScores.topicRelevance || 0
    }
    overallSum += qe.alignmentScore || 0
    if (question?.cognitiveLevel === qe.suggestedLevel) levelMatchCount++
  })

  Object.keys(rubricAverages).forEach(key => {
    rubricAverages[key as keyof RubricCriteria] = totalQuestions > 0
      ? rubricAverages[key as keyof RubricCriteria] / totalQuestions
      : 0
  })

  const overallAverage = totalQuestions > 0 ? overallSum / totalQuestions : 0
  const levelMatchRate = totalQuestions > 0 ? (levelMatchCount / totalQuestions) * 100 : 0

  const aiLevelCounts: Record<CognitiveLevel, number> = { Remember: 0, Understand: 0, Apply: 0, Analyze: 0, Evaluate: 0, Create: 0 }
  const evaluatorLevelCounts: Record<CognitiveLevel, number> = { Remember: 0, Understand: 0, Apply: 0, Analyze: 0, Evaluate: 0, Create: 0 }

  quiz.questions.forEach((q, index) => {
    if (q.cognitiveLevel) aiLevelCounts[q.cognitiveLevel]++
    const evalLevel = evaluation.questionEvaluations[index]?.suggestedLevel
    if (evalLevel) evaluatorLevelCounts[evalLevel]++
  })

  const scoreDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  evaluation.questionEvaluations.forEach(qe => {
    const score = Math.round(qe.alignmentScore || 3)
    if (score >= 1 && score <= 5) scoreDistribution[score]++
  })

  const gradeColor = overallAverage >= 4 ? "#51CF66" : overallAverage >= 3 ? "#FFD43B" : "#FF6B6B"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .ev-view * { box-sizing: border-box; }
        .ev-view { font-family: 'DM Sans', sans-serif; }

        @keyframes evBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .ev-blob { animation: evBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        .ev-qrow {
          padding: 16px 20px; cursor: pointer; transition: all .18s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .ev-qrow:last-child { border-bottom: none; }
        .ev-qrow:hover { background: rgba(255,255,255,0.02); }
        .ev-qrow.expanded { background: rgba(91,110,232,0.05); }

        .ev-stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 16px 20px;
          transition: border-color .2s, transform .2s;
        }
        .ev-stat-card:hover { border-color: rgba(91,110,232,0.25); transform: translateY(-1px); }

        @keyframes evFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ev-fadeup { animation: evFadeUp .3s ease forwards; }
        .ev-fadeup-1 { animation-delay: .05s; opacity: 0; }
        .ev-fadeup-2 { animation-delay: .1s; opacity: 0; }
        .ev-fadeup-3 { animation-delay: .15s; opacity: 0; }
      `}</style>

      <div className="ev-view" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>
        <div className="ev-blob" style={{ width: 300, height: 300, background: "rgba(91,110,232,0.08)", top: -60, left: 220, animationDuration: "11s" }} />
        <div className="ev-blob" style={{ width: 220, height: 220, background: "rgba(81,207,102,0.06)", bottom: 40, right: 60, animationDuration: "15s", animationDelay: "5s" }} />

        <EvaluatorMobileHeader />
        <EvaluatorSidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }} className="pt-14 md:pt-0">

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button suppressHydrationWarning onClick={() => router.push("/evaluator/dashboard")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Dashboard
              </button>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>{quiz.fileName}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Evaluation Results · <span style={{ textTransform: "capitalize" }}>{quiz.difficulty}</span></div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" /><path d="M6 3.5v3l2 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>
              {evaluation.evaluatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>

          {/* Main scrollable content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {error && (
              <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", color: "#ff8f8f", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* ── Summary cards ── */}
            <div className="ev-fadeup ev-fadeup-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
              {[
                {
                  icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="#7f9fff" strokeWidth="1.3" /><path d="M5 8h6M5 5.5h6M5 10.5h4" stroke="#7f9fff" strokeWidth="1.2" strokeLinecap="round" /></svg>,
                  label: "Questions", value: totalQuestions, color: "#7f9fff", bg: "rgba(91,110,232,0.1)",
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13l4-4 3 3 5-6" stroke="#58d68d" strokeWidth="1.5" strokeLinecap="round" /></svg>,
                  label: "Avg Score", value: `${overallAverage.toFixed(1)}/5`, color: gradeColor, bg: `${gradeColor}18`,
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#FFD43B" strokeWidth="1.3" /><path d="M5.5 8l2 2 4-4" stroke="#FFD43B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                  label: "Match Rate", value: `${levelMatchRate.toFixed(0)}%`, color: "#FFD43B", bg: "rgba(255,212,59,0.1)",
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l5 5 5-5M3 8l5 5 5-5" stroke="#eb984e" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                  label: "Difficulty", value: quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1), color: "#eb984e", bg: "rgba(235,152,78,0.1)",
                },
              ].map((s, i) => (
                <div key={i} className="ev-stat-card" style={{ borderTop: `2px solid ${s.color}30` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    {s.icon}
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── Two charts row ── */}
            <div className="ev-fadeup ev-fadeup-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 20 }}>

              {/* Rubric averages */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Rubric Criteria Averages</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(Object.keys(rubricAverages) as (keyof RubricCriteria)[]).map(key => {
                    const avg = rubricAverages[key]
                    const pct = (avg / 5) * 100
                    const barColor = avg >= 4 ? "#51CF66" : avg >= 3 ? "#FFD43B" : "#FF6B6B"
                    return (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: "rgba(255,255,255,0.55)" }}>{RUBRIC_LABELS[key]}</span>
                          <span style={{ fontWeight: 700, color: barColor }}>{avg.toFixed(2)}/5</span>
                        </div>
                        <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 100, transition: "width .8s ease" }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Score distribution */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Score Distribution</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
                  {[1, 2, 3, 4, 5].map(score => {
                    const count = scoreDistribution[score]
                    const maxCount = Math.max(...Object.values(scoreDistribution), 1)
                    const heightPct = (count / maxCount) * 100
                    const barColor = score >= 4 ? "#51CF66" : score === 3 ? "#FFD43B" : "#FF6B6B"
                    return (
                      <div key={score} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{count}</span>
                        <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: barColor, opacity: count > 0 ? 1 : 0.2, height: `${Math.max(heightPct, count > 0 ? 8 : 0)}%`, transition: "height .8s ease" }} />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{score}</span>
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 8 }}>Overall Alignment Score</p>
              </div>
            </div>

            {/* ── Cognitive Level Comparison ── */}
            <div className="ev-fadeup ev-fadeup-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>
                Cognitive Level Comparison <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.3)" }}>AI vs Evaluator</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
                {COGNITIVE_LEVELS.map(level => {
                  const lc = LEVEL_COLORS[level]
                  return (
                    <div key={level} style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>{level}</p>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${lc}18`, border: `1px solid ${lc}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: lc }}>{aiLevelCounts[level]}</span>
                          </div>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>AI</span>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(81,207,102,0.1)", border: "1px solid rgba(81,207,102,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: "#51CF66" }}>{evaluatorLevelCounts[level]}</span>
                          </div>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Eval</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Question breakdown (accordion) ── */}
            <div className="ev-fadeup ev-fadeup-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                  Question Breakdown
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Click a question to expand</span>
              </div>
              {quiz.questions.map((question, index) => {
                const qEval = evaluation.questionEvaluations[index]
                const levelMatch = question.cognitiveLevel === qEval?.suggestedLevel
                const isExpanded = activeQuestion === index
                const score = qEval?.alignmentScore || 0
                const scoreColor = score >= 4 ? "#51CF66" : score >= 3 ? "#FFD43B" : "#FF6B6B"

                return (
                  <div key={index} className={`ev-qrow${isExpanded ? " expanded" : ""}`} onClick={() => setActiveQuestion(isExpanded ? null : index)}>
                    {/* Row summary */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: "#fff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isExpanded ? "normal" : "nowrap", margin: 0, lineHeight: 1.5 }}>
                          {question.question}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor, background: `${scoreColor}15`, border: `1px solid ${scoreColor}30`, borderRadius: 100, padding: "2px 9px" }}>
                          {score}/5
                        </span>
                        {levelMatch
                          ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" fill="rgba(81,207,102,0.15)" /><path d="M4 7l2 2 4-4" stroke="#51CF66" strokeWidth="1.3" strokeLinecap="round" /></svg>
                          : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3v4M7 10v.5" stroke="#FFD43B" strokeWidth="1.4" strokeLinecap="round" /><circle cx="7" cy="7" r="5.5" stroke="#FFD43B" strokeWidth="1.2" /></svg>
                        }
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s", opacity: 0.3 }}>
                          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {/* Level comparison */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#9baeff", background: "rgba(91,110,232,0.12)", border: "1px solid rgba(91,110,232,0.2)", borderRadius: 100, padding: "3px 10px" }}>
                            AI: {question.cognitiveLevel || "N/A"}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#51CF66", background: "rgba(81,207,102,0.1)", border: "1px solid rgba(81,207,102,0.2)", borderRadius: 100, padding: "3px 10px" }}>
                            Evaluator: {qEval?.suggestedLevel || "N/A"}
                          </span>
                          <span style={{ fontSize: 11, color: levelMatch ? "#51CF66" : "#FFD43B", display: "flex", alignItems: "center", gap: 4 }}>
                            {levelMatch ? "✓ Level matched" : "⚠ Level mismatch"}
                          </span>
                        </div>

                        {/* Rubric scores */}
                        {qEval?.rubricScores && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginBottom: 10 }}>
                            {(Object.keys(RUBRIC_LABELS) as (keyof RubricCriteria)[]).map(key => {
                              const val = qEval.rubricScores?.[key] || 0
                              const c = val >= 4 ? "#51CF66" : val >= 3 ? "#FFD43B" : "#FF6B6B"
                              return (
                                <div key={key} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{RUBRIC_LABELS[key]}</span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{val}/5</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Notes */}
                        {qEval?.notes && (
                          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>Evaluator Notes</p>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>{qEval.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}