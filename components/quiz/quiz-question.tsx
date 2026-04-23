"use client"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswers: number[]
  type: "single" | "multiple"
}

interface QuizQuestionProps {
  question: Question
  selectedAnswers: number[]
  onSelectAnswer: (optionIndex: number) => void
}

export default function QuizQuestion({
  question,
  selectedAnswers,
  onSelectAnswer,
}: QuizQuestionProps) {
  return (
    <div style={{ width: "100%" }}>
      {/* Question text */}
      <h2
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(16px, 2.5vw, 20px)",
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 24px",
          lineHeight: 1.45,
          textAlign: "center",
        }}
      >
        {question.question}
      </h2>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswers.includes(index)
          return (
            <button
              key={index}
              onClick={() => onSelectAnswer(index)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderRadius: 12,
                border: isSelected
                  ? "1.5px solid #5B6EE8"
                  : "1.5px solid rgba(255,255,255,0.1)",
                background: isSelected
                  ? "rgba(91,110,232,0.18)"
                  : "rgba(255,255,255,0.03)",
                color: "#fff",
                textAlign: "left",
                fontSize: 14,
                fontWeight: isSelected ? 600 : 400,
                width: "100%",
                cursor: "pointer",
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                transition: "all .18s",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  ;(e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(91,110,232,0.5)"
                  ;(e.currentTarget as HTMLElement).style.background =
                    "rgba(91,110,232,0.08)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  ;(e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.1)"
                  ;(e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.03)"
                }
              }}
            >
              {/* Letter badge */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: isSelected
                    ? "#5B6EE8"
                    : "rgba(255,255,255,0.08)",
                  border: isSelected
                    ? "none"
                    : "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: isSelected ? "#fff" : "rgba(255,255,255,0.5)",
                  flexShrink: 0,
                }}
              >
                {String.fromCharCode(65 + index)}
              </div>

              <span style={{ flex: 1 }}>{option}</span>

              {/* Check icon when selected */}
              {isSelected && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="8" cy="8" r="7" fill="#5B6EE8" />
                  <path
                    d="M5 8l2 2 4-4"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {/* Instruction hint */}
      <p
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          textAlign: "center",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        {question.type === "multiple"
          ? "Select all correct answers"
          : "Select the correct answer"}
      </p>
    </div>
  )
}