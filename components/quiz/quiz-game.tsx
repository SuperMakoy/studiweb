"use client"

import { useState, useEffect } from "react"
import QuizQuestion from "./quiz-question"
import QuizResults from "./quiz-results"

type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswers: number[]
  type: "single" | "multiple"
  cognitiveLevel?: CognitiveLevel
}

interface Quiz {
  fileName: string
  questions: Question[]
}

interface QuizGameProps {
  quiz: Quiz
  fileId: string
  totalTimeMinutes?: number
  difficulty?: "easy" | "moderate" | "hard"
}

interface AnswerRecord {
  questionId: number
  isCorrect: boolean
  timeSpent: number
  cognitiveLevel?: CognitiveLevel
}

interface CognitiveLevelStats {
  total: number
  correct: number
}

const LEVEL_COLORS: Record<CognitiveLevel, string> = {
  Remember: "#7f9fff",
  Understand: "#5dade2",
  Apply: "#58d68d",
  Analyze: "#f8c471",
  Evaluate: "#eb984e",
  Create: "#f1948a",
}

export default function QuizGame({
  quiz,
  fileId,
  totalTimeMinutes = 15,
  difficulty = "moderate",
}: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({})
  const [showResults, setShowResults] = useState(false)
  const totalTimeSeconds = totalTimeMinutes * 60
  const [timeRemaining, setTimeRemaining] = useState(totalTimeSeconds)
  const [finalTimeElapsed, setFinalTimeElapsed] = useState<number | null>(null)

  const [totalPoints, setTotalPoints] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([])
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const isTimeLow = timeRemaining < 60

  useEffect(() => {
    if (showResults) return
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setFinalTimeElapsed(totalTimeSeconds - prev)
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [showResults, totalTimeSeconds])

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const handleSelectAnswer = (optionIndex: number) => {
    const questionId = currentQuestion.id
    const currentAnswers = selectedAnswers[questionId] || []
    if (currentQuestion.type === "single") {
      setSelectedAnswers({ ...selectedAnswers, [questionId]: [optionIndex] })
    } else {
      const newAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter((a) => a !== optionIndex)
        : [...currentAnswers, optionIndex]
      setSelectedAnswers({ ...selectedAnswers, [questionId]: newAnswers })
    }
  }

  const calculateQuestionPoints = (isCorrect: boolean, timeSpent: number) => {
    if (!isCorrect) {
      const newPoints = Math.floor(totalPoints / 2)
      setTotalPoints(newPoints)
      setCurrentStreak(0)
      return newPoints
    }
    const basePoints = 25
    const speedMultiplier = timeSpent <= 15 ? 1.2 : 1.0
    const newStreak = currentStreak + 1
    setCurrentStreak(newStreak)
    const earnedPoints = Math.round(basePoints * speedMultiplier * newStreak)
    const newTotalPoints = totalPoints + earnedPoints
    setTotalPoints(newTotalPoints)
    return newTotalPoints
  }

  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const userAnswers = selectedAnswers[currentQuestion.id] || []
    const isCorrect =
      userAnswers.length === currentQuestion.correctAnswers.length &&
      userAnswers.every((a) => currentQuestion.correctAnswers.includes(a))

    setAnswerHistory([
      ...answerHistory,
      { questionId: currentQuestion.id, isCorrect, timeSpent, cognitiveLevel: currentQuestion.cognitiveLevel },
    ])

    const finalPoints = calculateQuestionPoints(isCorrect, timeSpent)

    if (isLastQuestion) {
      setFinalTimeElapsed(totalTimeSeconds - timeRemaining)
      setTotalPoints(finalPoints)
      setShowResults(true)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1)
  }

  const handleQuit = () => {
    if (confirm("Are you sure you want to quit? Your progress will be lost.")) {
      window.location.href = "/dashboard"
    }
  }

  const calculateScore = () => {
    let correctCount = 0
    quiz.questions.forEach((question) => {
      const userAnswers = selectedAnswers[question.id] || []
      const isCorrect =
        userAnswers.length === question.correctAnswers.length &&
        userAnswers.every((a) => question.correctAnswers.includes(a))
      if (isCorrect) correctCount++
    })
    return correctCount
  }

  const calculateCognitiveLevelStats = (): Record<CognitiveLevel, CognitiveLevelStats> => {
    const stats: Record<CognitiveLevel, CognitiveLevelStats> = {
      Remember: { total: 0, correct: 0 },
      Understand: { total: 0, correct: 0 },
      Apply: { total: 0, correct: 0 },
      Analyze: { total: 0, correct: 0 },
      Evaluate: { total: 0, correct: 0 },
      Create: { total: 0, correct: 0 },
    }
    quiz.questions.forEach((question) => {
      const level = question.cognitiveLevel || "Remember"
      stats[level].total++
      const userAnswers = selectedAnswers[question.id] || []
      const isCorrect =
        userAnswers.length === question.correctAnswers.length &&
        userAnswers.every((a) => question.correctAnswers.includes(a))
      if (isCorrect) stats[level].correct++
    })
    return stats
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const timeElapsed = finalTimeElapsed !== null ? finalTimeElapsed : totalTimeSeconds - timeRemaining
  const progressPct = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const levelColor = currentQuestion.cognitiveLevel
    ? LEVEL_COLORS[currentQuestion.cognitiveLevel]
    : "#7f9fff"

  if (showResults) {
    return (
      <QuizResults
        score={calculateScore()}
        totalQuestions={quiz.questions.length}
        fileName={quiz.fileName}
        timeElapsed={formatTime(timeElapsed)}
        fileId={fileId}
        difficulty={difficulty}
        points={totalPoints}
        cognitiveLevelStats={calculateCognitiveLevelStats()}
      />
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .qg-wrap { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .qg-opt { transition: all .18s; cursor: pointer; }
        .qg-opt:hover { border-color: rgba(91,110,232,0.6) !important; background: rgba(91,110,232,0.1) !important; }
        .qg-opt.selected { background: rgba(91,110,232,0.18) !important; border-color: #5B6EE8 !important; }
        .qg-btn { transition: all .2s; cursor: pointer; font-family: 'DM Sans', inherit; }
        .qg-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .qg-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @keyframes qgPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,107,107,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(255,107,107,0); }
        }
        .timer-low { animation: qgPulse 1s ease-in-out infinite; }
      `}</style>

      <div
        className="qg-wrap"
        style={{
          width: "100%",
          maxWidth: 640,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        {/* Top bar: progress + timer + score */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "12px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Question counter */}
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 15,
              fontWeight: 800,
              color: "#9baeff",
              flexShrink: 0,
            }}
          >
            {currentQuestionIndex + 1}/{quiz.questions.length}
          </span>

          {/* Progress bar */}
          <div
            style={{
              flex: 1,
              height: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 100,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: "linear-gradient(90deg,#5B6EE8,#9b7fe8)",
                borderRadius: 100,
                transition: "width .4s ease",
              }}
            />
          </div>

          {/* Timer */}
          <span
            className={isTimeLow ? "timer-low" : ""}
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 15,
              fontWeight: 800,
              color: isTimeLow ? "#FF6B6B" : "#fff",
              flexShrink: 0,
              background: isTimeLow ? "rgba(255,107,107,0.1)" : "rgba(255,255,255,0.05)",
              border: isTimeLow ? "1px solid rgba(255,107,107,0.3)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "4px 10px",
            }}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Points + streak */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7L8 1z" fill="#FFD43B" />
            </svg>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Points</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#FFD43B" }}>
                {totalPoints.toLocaleString()}
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>🔥</span>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Streak</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#eb984e" }}>
                {currentStreak}×
              </div>
            </div>
          </div>

          {/* Cognitive level badge */}
          {currentQuestion.cognitiveLevel && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 14px",
                background: `${levelColor}15`,
                border: `1px solid ${levelColor}30`,
                borderRadius: 12,
                gap: 6,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: levelColor,
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: levelColor }}>
                {currentQuestion.cognitiveLevel}
              </span>
            </div>
          )}
        </div>

        {/* Question card */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "28px 24px",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(16px, 2.5vw, 20px)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 24px",
              lineHeight: 1.45,
            }}
          >
            {currentQuestion.question}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = (selectedAnswers[currentQuestion.id] || []).includes(index)
              return (
                <button
                  key={index}
                  className={`qg-opt${isSelected ? " selected" : ""}`}
                  onClick={() => handleSelectAnswer(index)}
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
                    fontFamily: "inherit",
                  }}
                >
                  {/* Option letter */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: isSelected ? "#5B6EE8" : "rgba(255,255,255,0.08)",
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
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="8" cy="8" r="7" fill="#5B6EE8" />
                      <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          <p
            style={{
              marginTop: 16,
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              textAlign: "center",
            }}
          >
            {currentQuestion.type === "multiple"
              ? "Select all correct answers"
              : "Select the correct answer"}
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <button
            className="qg-btn"
            onClick={handleQuit}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,107,107,0.7)",
              background: "rgba(255,107,107,0.08)",
              border: "1px solid rgba(255,107,107,0.2)",
            }}
          >
            Quit
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="qg-btn"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              ← Previous
            </button>

            <button
              className="qg-btn"
              onClick={handleNext}
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                border: "none",
                boxShadow: "0 4px 14px rgba(91,110,232,0.35)",
              }}
            >
              {isLastQuestion ? "Finish 🏁" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}