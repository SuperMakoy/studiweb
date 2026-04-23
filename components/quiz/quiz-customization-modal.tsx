"use client"

import { useState } from "react"

export interface QuizCustomizationConfig {
  length: number
  difficulty: "easy" | "moderate" | "hard"
  timePerQuestion: number
  totalTime: number
}

interface QuizCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (config: QuizCustomizationConfig) => void
  isLoading?: boolean
}

const DIFFICULTY_META = {
  easy:     { emoji: "🟢", label: "Easy",     color: "#58d68d", bg: "rgba(81,207,102,0.12)",  border: "rgba(81,207,102,0.3)"  },
  moderate: { emoji: "🟡", label: "Moderate", color: "#FFD43B", bg: "rgba(255,212,59,0.12)",  border: "rgba(255,212,59,0.3)"  },
  hard:     { emoji: "🔴", label: "Hard",     color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", border: "rgba(255,107,107,0.3)" },
}

export default function QuizCustomizationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: QuizCustomizationModalProps) {
  const [length, setLength] = useState<number>(10)
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard">("moderate")

  // ── logic unchanged ──
  const timePerQuestion = 1.5
  const totalTime = Math.round(length * timePerQuestion)

  const handleConfirm = () => {
    onConfirm({ length, difficulty, timePerQuestion, totalTime })
  }

  if (!isOpen) return null

  const meta = DIFFICULTY_META[difficulty]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .qcm-wrap { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .qcm-diff-btn { transition: all .18s; cursor: pointer; font-family: inherit; }
        .qcm-diff-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .qcm-btn { transition: all .2s; cursor: pointer; font-family: inherit; }
        .qcm-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .qcm-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .qcm-close:hover { background: rgba(255,255,255,0.1) !important; }

        /* Custom range slider */
        .qcm-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 100px;
          background: rgba(255,255,255,0.08);
          outline: none;
        }
        .qcm-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #5B6EE8;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(91,110,232,0.2);
          transition: box-shadow .2s;
        }
        .qcm-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(91,110,232,0.3);
        }
        .qcm-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #5B6EE8;
          cursor: pointer;
          border: none;
        }

        @keyframes qcmFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .qcm-card { animation: qcmFadeIn .22s ease forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          zIndex: 40,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: 16,
          pointerEvents: "none",
        }}
      >
        <div
          className="qcm-wrap qcm-card"
          onClick={(e) => e.stopPropagation()}
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: 400,
            background: "#0d0d2b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 22,
            padding: "28px 28px 24px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 4px",
                  letterSpacing: -0.5,
                }}
              >
                Customize Quiz
              </h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                Configure before we generate your quiz
              </p>
            </div>
            <button
              className="qcm-close"
              onClick={onClose}
              disabled={isLoading}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "none",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 18,
                lineHeight: 1,
                transition: "background .15s",
              }}
            >
              ×
            </button>
          </div>

          {/* ── Question count slider ── */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <label
                style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}
              >
                Number of Questions
              </label>
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#9baeff",
                }}
              >
                {length}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              disabled={isLoading}
              className="qcm-slider"
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
                marginTop: 6,
                letterSpacing: "0.5px",
              }}
            >
              <span>10 min</span>
              <span>50 max</span>
            </div>
          </div>

          {/* ── Difficulty ── */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 10,
              }}
            >
              Difficulty Level
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["easy", "moderate", "hard"] as const).map((level) => {
                const m = DIFFICULTY_META[level]
                const active = difficulty === level
                return (
                  <button
                    key={level}
                    className="qcm-diff-btn"
                    onClick={() => setDifficulty(level)}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      borderRadius: 12,
                      border: active ? `1.5px solid ${m.border}` : "1.5px solid rgba(255,255,255,0.08)",
                      background: active ? m.bg : "rgba(255,255,255,0.03)",
                      color: active ? m.color : "rgba(255,255,255,0.45)",
                      fontSize: 12,
                      fontWeight: 700,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{m.emoji}</span>
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Time summary ── */}
          <div
            style={{
              background: `${meta.bg}`,
              border: `1px solid ${meta.border}`,
              borderRadius: 14,
              padding: "14px 18px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
                Estimated Time
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: meta.color,
                }}
              >
                {totalTime} min
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                ~{timePerQuestion} min per question
              </div>
            </div>
            <div style={{ fontSize: 36, opacity: 0.8 }}>⏱</div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="qcm-btn"
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Cancel
            </button>
            <button
              className="qcm-btn"
              onClick={handleConfirm}
              disabled={isLoading}
              style={{
                flex: 2,
                padding: "12px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                background: isLoading
                  ? "rgba(91,110,232,0.5)"
                  : "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                border: "none",
                boxShadow: isLoading ? "none" : "0 4px 14px rgba(91,110,232,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isLoading ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                    <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>🎮 Start Quiz</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}