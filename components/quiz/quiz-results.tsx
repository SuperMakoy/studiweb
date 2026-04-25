"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { saveQuizResult } from "@/lib/file-service"

type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

interface CognitiveLevelStats {
  total: number
  correct: number
}

interface QuizResultsProps {
  score: number
  totalQuestions: number
  fileName: string
  timeElapsed: string
  fileId?: string
  difficulty?: "easy" | "moderate" | "hard"
  points?: number
  cognitiveLevelStats?: Record<CognitiveLevel, CognitiveLevelStats>
}

const LEVEL_COLORS: Record<CognitiveLevel, string> = {
  Remember: "#7f9fff",
  Understand: "#5dade2",
  Apply: "#58d68d",
  Analyze: "#f8c471",
  Evaluate: "#eb984e",
  Create: "#f1948a",
}

export default function QuizResults({
  score,
  totalQuestions,
  fileName,
  timeElapsed,
  fileId,
  difficulty = "moderate",
  points = 0,
  cognitiveLevelStats,
}: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const hasSaved = useRef(false)

  useEffect(() => {
    if (fileId && !hasSaved.current) {
      hasSaved.current = true
      saveQuizResult(fileId, fileName, score, totalQuestions, timeElapsed, difficulty, points).catch(
        (err) => console.error("Failed to save quiz result:", err)
      )
    }
  }, [fileId, fileName, score, totalQuestions, timeElapsed, difficulty, points])

  const getGrade = () => {
    if (percentage >= 90) return { label: "Excellent!", color: "#58d68d", emoji: "🏆" }
    if (percentage >= 75) return { label: "Great Job!", color: "#5dade2", emoji: "⭐" }
    if (percentage >= 60) return { label: "Good Effort!", color: "#f8c471", emoji: "👍" }
    return { label: "Keep Practicing!", color: "#f1948a", emoji: "💪" }
  }

  const getPerformanceAnalysis = (): string => {
    const weaker: CognitiveLevel[] = []
    const stronger: CognitiveLevel[] = []

    if (cognitiveLevelStats) {
      (["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as CognitiveLevel[]).forEach((level) => {
        const stats = cognitiveLevelStats[level]
        if (stats.total > 0) {
          const pct = Math.round((stats.correct / stats.total) * 100)
          if (pct >= 75) {
            stronger.push(level)
          } else if (pct < 50) {
            weaker.push(level)
          }
        }
      })
    }

    let analysis = ""
    if (percentage >= 90) {
      analysis = `Outstanding performance! You demonstrated mastery across the material. Continue practicing with challenging questions to deepen your understanding.`
    } else if (percentage >= 75) {
      analysis = `Strong performance! You've shown solid understanding of the material. ${weaker.length > 0 ? `Focus more on ${weaker.join(" and ")} level questions to strengthen these areas.` : ""}`
    } else if (percentage >= 60) {
      analysis = `Good effort! You're building a foundation. ${weaker.length > 0 ? `Consider spending more time on ${weaker.join(" and ")} level content to improve.` : "Review the material and try again to improve your score."}`
    } else {
      analysis = `Keep practicing! Review the material carefully. ${weaker.length > 0 ? `Pay special attention to ${weaker.join(" and ")} level concepts.` : "Try again and focus on understanding the core concepts."}`
    }

    return analysis
  }

  const grade = getGrade()

  const difficultyColors: Record<string, string> = {
    easy: "#58d68d",
    moderate: "#f8c471",
    hard: "#f1948a",
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .qr-wrap { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .qr-btn { transition: all .2s; cursor: pointer; font-family: inherit; }
        .qr-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        @keyframes qrFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .qr-fadeup { animation: qrFadeUp .5s ease forwards; }
        .qr-fadeup-1 { animation-delay: .1s; opacity: 0; }
        .qr-fadeup-2 { animation-delay: .2s; opacity: 0; }
        .qr-fadeup-3 { animation-delay: .3s; opacity: 0; }
        .qr-fadeup-4 { animation-delay: .4s; opacity: 0; }
        @keyframes qrGrow {
          from { width: 0; }
        }
        .qr-bar { animation: qrGrow .8s ease forwards; animation-delay: .5s; width: 0; }
        @keyframes qrScore {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .qr-score-anim { animation: qrScore .6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      <div
        className="qr-wrap"
        style={{
          width: "100%",
          maxWidth: 540,
          margin: "0 auto",
          padding: "0 16px 40px",
        }}
      >
        {/* Grade badge */}
        <div className="qr-fadeup qr-fadeup-1" style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: `${grade.color}15`,
              border: `1px solid ${grade.color}30`,
              borderRadius: 100,
              padding: "6px 18px",
              fontSize: 12,
              fontWeight: 700,
              color: grade.color,
              letterSpacing: "0.6px",
            }}
          >
            <span>{grade.emoji}</span>
            {grade.label}
          </div>
        </div>

        {/* Score circle */}
        <div className="qr-fadeup qr-fadeup-1" style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            className="qr-score-anim"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: `3px solid ${grade.color}40`,
              boxShadow: `0 0 40px ${grade.color}20, inset 0 0 20px ${grade.color}08`,
            }}
          >
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 42,
                fontWeight: 800,
                color: grade.color,
                lineHeight: 1,
              }}
            >
              {percentage}%
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              {score}/{totalQuestions}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div
          className="qr-fadeup qr-fadeup-2"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Points", value: points.toLocaleString(), icon: "⭐", color: "#FFD43B" },
            { label: "Time", value: timeElapsed, icon: "⏱", color: "#7f9fff" },
            {
              label: "Difficulty",
              value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
              icon: difficulty === "easy" ? "🟢" : difficulty === "moderate" ? "🟡" : "🔴",
              color: difficultyColors[difficulty],
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "14px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: stat.color,
                  marginBottom: 2,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* File name */}
        <div
          className="qr-fadeup qr-fadeup-2"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" opacity="0.4">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="#fff" strokeWidth="1.5" />
            <path d="M5 8h6M5 5.5h6M5 10.5h4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fileName}
          </span>
        </div>

        {/* Performance analysis */}
        <div
          className="qr-fadeup qr-fadeup-2"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: "16px 18px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              marginBottom: 10,
            }}
          >
            💡 Performance Insight
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            {getPerformanceAnalysis()}
          </div>
        </div>

        {/* Cognitive level breakdown */}
        {cognitiveLevelStats && (
          <div
            className="qr-fadeup qr-fadeup-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "18px 20px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                marginBottom: 16,
              }}
            >
              Bloom&apos;s Taxonomy Breakdown
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as CognitiveLevel[]).map(
                (level) => {
                  const stats = cognitiveLevelStats[level]
                  if (stats.total === 0) return null
                  const pct = Math.round((stats.correct / stats.total) * 100)
                  const color = LEVEL_COLORS[level]
                  return (
                    <div key={level}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 5,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{level}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                          {stats.correct}/{stats.total} · {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: "rgba(255,255,255,0.07)",
                          borderRadius: 100,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="qr-bar"
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: color,
                            borderRadius: 100,
                          }}
                        />
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div
          className="qr-fadeup qr-fadeup-4"
          style={{ display: "flex", gap: 10 }}
        >
          <Link href="/file-library" style={{ flex: 1, textDecoration: "none" }}>
            <button
              className="qr-btn"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              📁 Back to Files
            </button>
          </Link>

          <Link href="/dashboard" style={{ flex: 1, textDecoration: "none" }}>
            <button
              className="qr-btn"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                border: "none",
                boxShadow: "0 4px 14px rgba(91,110,232,0.3)",
              }}
            >
              🏠 Dashboard
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}
