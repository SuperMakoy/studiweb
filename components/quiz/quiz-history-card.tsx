"use client"

import { useState } from "react"

interface QuizHistoryCardProps {
  quiz: {
    id: string
    fileName?: string
    displayName?: string
    score: number
    totalQuestions: number
    points: number
    timeElapsed: string
    difficulty: string
    completedAt?: Date
  }
  showFileName?: boolean
}

const DIFFICULTY_CONFIG = {
  easy:     { color: "#51CF66", bg: "rgba(81,207,102,0.12)",  border: "rgba(81,207,102,0.25)",  icon: "🏆", label: "Easy"     },
  moderate: { color: "#FFD43B", bg: "rgba(255,212,59,0.12)",  border: "rgba(255,212,59,0.25)",  icon: "⚡", label: "Moderate" },
  hard:     { color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", border: "rgba(255,107,107,0.25)", icon: "🔥", label: "Hard"     },
}

export default function QuizHistoryCard({ quiz, showFileName = true }: QuizHistoryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const percentage = Math.round((quiz.score / quiz.totalQuestions) * 100)
  const diff = DIFFICULTY_CONFIG[quiz.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.moderate

  const gradeColor =
    percentage >= 90 ? "#51CF66" :
    percentage >= 75 ? "#7f9fff" :
    percentage >= 60 ? "#FFD43B" : "#FF6B6B"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .qhc { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .qhc-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all .2s;
          position: relative;
          overflow: hidden;
        }
        .qhc-card:hover {
          border-color: rgba(91,110,232,0.35);
          background: rgba(91,110,232,0.07);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .qhc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--grade-color), transparent);
          opacity: 0.6;
        }

        /* Modal */
        .qhc-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .qhc-modal {
          background: #0d0d2b;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 32px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 32px 64px rgba(0,0,0,0.6);
          animation: qhcPop .25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes qhcPop {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .qhc-modal-close {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s; color: rgba(255,255,255,0.5);
          font-size: 18px; line-height: 1;
        }
        .qhc-modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

        .qhc-stat-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px 16px;
          flex: 1;
        }
      `}</style>

      {/* Card */}
      <div
        className="qhc"
        style={{ "--grade-color": gradeColor } as React.CSSProperties}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="qhc-card">
          {/* Top row: icon + difficulty */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: diff.bg, border: `1px solid ${diff.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}
            >
              {diff.icon}
            </div>
            <span
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.8px",
                textTransform: "uppercase",
                color: diff.color,
                background: diff.bg,
                border: `1px solid ${diff.border}`,
                borderRadius: 100,
                padding: "3px 10px",
              }}
            >
              {diff.label}
            </span>
          </div>

          {/* Score */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 28, fontWeight: 800,
                color: gradeColor,
                lineHeight: 1,
              }}
            >
              {percentage}%
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
              {quiz.score}/{quiz.totalQuestions}
            </span>
          </div>

          {/* Points + time */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "#FFD43B", fontWeight: 600 }}>
              ⭐ {(quiz.points || 0).toLocaleString()} pts
            </span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              ⏱ {quiz.timeElapsed}
            </span>
          </div>

          {/* File name */}
          {showFileName && (
            <div
              style={{
                fontSize: 11, color: "rgba(255,255,255,0.4)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 10,
              }}
            >
              📁 {quiz.displayName || quiz.fileName}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="qhc qhc-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="qhc-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div
                  style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "1.2px",
                    textTransform: "uppercase", color: "#7f9fff",
                    marginBottom: 4,
                  }}
                >
                  Quiz Result
                </div>
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 22, fontWeight: 800, color: "#fff", margin: 0,
                  }}
                >
                  {quiz.displayName || quiz.fileName || "Quiz Details"}
                </h2>
              </div>
              <button className="qhc-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            {/* Score hero */}
            <div
              style={{
                textAlign: "center",
                background: `radial-gradient(ellipse at 50% 0%, ${gradeColor}18 0%, transparent 70%)`,
                border: `1px solid ${gradeColor}20`,
                borderRadius: 16,
                padding: "24px 16px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 64, fontWeight: 800,
                  color: gradeColor,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {percentage}%
              </div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.45)" }}>
                {quiz.score} correct out of {quiz.totalQuestions}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div className="qhc-stat-box" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>⭐</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#FFD43B" }}>
                  {(quiz.points || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 2 }}>Points</div>
              </div>
              <div className="qhc-stat-box" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>⏱</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#7f9fff" }}>
                  {quiz.timeElapsed}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 2 }}>Time</div>
              </div>
              <div className="qhc-stat-box" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{diff.icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: diff.color }}>
                  {diff.label}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 2 }}>Level</div>
              </div>
            </div>

            {/* Completed on */}
            {quiz.completedAt && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" opacity="0.4">
                  <rect x="1" y="2" width="12" height="11" rx="2" stroke="#fff" strokeWidth="1.2" />
                  <path d="M4 1v2M10 1v2M1 6h12" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                  {new Date(quiz.completedAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}