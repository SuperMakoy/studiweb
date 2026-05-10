"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getUserRole } from "@/lib/auth-service"
import { getTeacherFile } from "@/lib/teacher-file-service"
import {
  generateTeacherQuiz,
  getTeacherQuiz,
  saveQuestionEdits,
  regenerateSingleQuestion,
  saveTeacherQuiz,
  type TeacherQuiz,
  type TeacherQuestion,
} from "@/lib/teacher-quiz-service"

const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const

export default function CreateQuizPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const fileId = params.fileId as string

  const [userRole, setUserRole] = useState<string | null>(null)
  const [file, setFile] = useState<any>(null)
  const [quiz, setQuiz] = useState<TeacherQuiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [quizTitle, setQuizTitle] = useState("")
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard">("moderate")

  // Check auth and role
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/")
      return
    }

    const checkRole = async () => {
      const role = await getUserRole(user.uid)
      setUserRole(role)
      if (role !== "teacher") {
        router.push(role === "evaluator" ? "/evaluator/dashboard" : "/dashboard")
      }
    }

    checkRole()
  }, [user, authLoading, router])

  // Load file only (don't auto-generate quiz)
  useEffect(() => {
    if (!user || userRole !== "teacher" || !fileId) return

    const loadFile = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load the teacher file
        const teacherFile = await getTeacherFile(fileId)
        if (!teacherFile) {
          setError("File not found")
          return
        }

        setFile(teacherFile)
      } catch (err) {
        console.error("[v0] Error loading file:", err)
        setError(err instanceof Error ? err.message : "Failed to load file")
      } finally {
        setIsLoading(false)
        setIsGenerating(false)
      }
    }

    loadFile()
  }, [user, userRole, fileId])

  const currentQuestion = quiz?.questions[currentQuestionIndex]

  const handleGenerateQuiz = async () => {
    if (!file) return

    try {
      setIsGenerating(true)
      setError(null)
      const newQuiz = await generateTeacherQuiz(fileId, file.displayName || file.fileName, {
        length: numQuestions,
        difficulty,
      })
      setQuiz(newQuiz)
      setQuizTitle(newQuiz.title)
      setCurrentQuestionIndex(0)
    } catch (err) {
      console.error("[v0] Error generating quiz:", err)
      setError(err instanceof Error ? err.message : "Failed to generate quiz")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleQuestionChange = (field: keyof TeacherQuestion, value: any) => {
    if (!quiz) return

    const updated = { ...quiz }
    const q = updated.questions[currentQuestionIndex]

    if (field === "text" || field === "explanation" || field === "bloomsLevel") {
      ;(q as any)[field] = value
    } else if (field === "options") {
      q.options = value
    } else if (field === "correctAnswer") {
      q.correctAnswer = value
    }

    setQuiz(updated)
  }

  const handleSaveQuestion = async () => {
    if (!quiz || !currentQuestion) return

    try {
      setError(null)
      await saveQuestionEdits(fileId, quiz.id, currentQuestion.id, {
        text: currentQuestion.text,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer,
        bloomsLevel: currentQuestion.bloomsLevel,
        explanation: currentQuestion.explanation,
      })

      // Move to next question
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        // All questions done, show save dialog
        setShowSaveDialog(true)
      }
    } catch (err) {
      console.error("[v0] Error saving question:", err)
      setError(err instanceof Error ? err.message : "Failed to save question")
    }
  }

  const handleRegenerateQuestion = async () => {
    if (!quiz || !currentQuestion) return

    try {
      setIsRegenerating(true)
      setError(null)

      const newQuestion = await regenerateSingleQuestion(
        fileId,
        quiz.id,
        currentQuestion.id,
        currentQuestion.bloomsLevel
      )

      if (newQuestion) {
        // Update local state
        const updated = { ...quiz }
        updated.questions[currentQuestionIndex] = newQuestion
        setQuiz(updated)
      }
    } catch (err) {
      console.error("[v0] Error regenerating question:", err)
      setError(err instanceof Error ? err.message : "Failed to regenerate question")
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSaveQuiz = async () => {
    if (!quiz) return

    try {
      await saveTeacherQuiz(fileId, quiz.id, quizTitle)
      router.push("/teacher/my-quizzes")
    } catch (err) {
      console.error("[v0] Error saving quiz:", err)
      setError(err instanceof Error ? err.message : "Failed to save quiz")
    }
  }

  if (authLoading || isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!file) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>File not found</p>
      </div>
    )
  }

  // If no quiz yet, show preferences screen
  if (!quiz) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)",
        color: "#fff",
        padding: "40px 24px",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <Link
            href="/teacher/dashboard"
            style={{
              color: "#9baeff",
              textDecoration: "none",
              fontSize: 14,
              marginBottom: 32,
              display: "inline-block",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#b0c4ff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9baeff")}
          >
            ← Back to Dashboard
          </Link>

          <div style={{ marginBottom: 48 }}>
            <h1 style={{
              fontSize: 40,
              fontWeight: 800,
              marginBottom: 12,
              letterSpacing: -0.5,
              background: "linear-gradient(135deg, #fff 0%, #9baeff 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Craft a Quiz
            </h1>
            <p style={{
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.6)",
              marginBottom: 8,
            }}>
              From: <span style={{ fontWeight: 600, color: "#fff" }}>{file.displayName || file.fileName}</span>
            </p>
            <p style={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.5)",
            }}>
              Configure your quiz parameters to generate questions aligned with Bloom's Taxonomy.
            </p>
          </div>

          {error && (
            <div style={{
              background: "rgba(255, 107, 107, 0.15)",
              border: "1px solid rgba(255, 107, 107, 0.4)",
              color: "#ff8787",
              padding: "14px 16px",
              borderRadius: 12,
              marginBottom: 24,
              fontSize: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(91, 110, 232, 0.15)",
            borderRadius: 16,
            padding: 32,
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 12,
                color: "rgba(255, 255, 255, 0.8)",
              }}>
                Number of Questions
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(5, Math.min(50, parseInt(e.target.value) || 10)))}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(91, 110, 232, 0.25)",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 14,
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.25)")}
                />
                <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.5)" }}>({numQuestions} questions)</span>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 14,
                color: "rgba(255, 255, 255, 0.8)",
              }}>
                Difficulty Level
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {(["easy", "moderate", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    style={{
                      padding: "12px 16px",
                      background: difficulty === level
                        ? "linear-gradient(135deg, #5B6EE8, #7b5ea7)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: difficulty === level
                        ? "1px solid rgba(91, 110, 232, 0.6)"
                        : "1px solid rgba(91, 110, 232, 0.2)",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textTransform: "capitalize",
                      boxShadow: difficulty === level ? "0 4px 12px rgba(91, 110, 232, 0.3)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (difficulty !== level) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                        e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.35)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (difficulty !== level) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.2)";
                      }
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: isGenerating
                  ? "rgba(91, 110, 232, 0.4)"
                  : "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.7 : 1,
                transition: "all 0.3s",
                boxShadow: isGenerating ? "none" : "0 8px 24px rgba(91, 110, 232, 0.35)",
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(91, 110, 232, 0.45)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(91, 110, 232, 0.35)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isGenerating ? (
                <span>✨ Generating Quiz...</span>
              ) : (
                <span>✨ Generate Quiz</span>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>No questions found</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)", padding: "40px 24px", color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Link 
            href="/teacher/dashboard" 
            style={{ 
              color: "#9baeff", 
              textDecoration: "none", 
              fontSize: 14,
              marginBottom: 16,
              display: "inline-block",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#b0c4ff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9baeff")}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>
            Refine Your Quiz
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: 4 }}>
            From: <span style={{ fontWeight: 600, color: "#fff" }}>{file?.displayName || file?.fileName}</span>
          </p>
        </div>

        {/* Progress */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(91, 110, 232, 0.15)", padding: 24, borderRadius: 16, marginBottom: 24, backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>
              Question {currentQuestionIndex + 1} / {quiz.questions.length}
            </div>
            <div style={{ flex: 1, height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #5B6EE8, #7b5ea7)",
                  borderRadius: 3,
                  width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                  transition: "width 0.3s ease-out",
                  boxShadow: "0 0 20px rgba(91, 110, 232, 0.5)",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.5)" }}>
              {Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(255, 107, 107, 0.15)",
                border: "1px solid rgba(255, 107, 107, 0.4)",
                color: "#ff8787",
                padding: "12px 16px",
                borderRadius: 10,
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Question Editor */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(91, 110, 232, 0.15)", borderRadius: 16, padding: 32, marginBottom: 24, backdropFilter: "blur(10px)" }}>
          {/* Bloom's Level Selector */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 12, fontSize: 14, color: "rgba(255, 255, 255, 0.8)" }}>
              Bloom&apos;s Cognitive Level
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {BLOOM_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleQuestionChange("bloomsLevel", level)}
                  style={{
                    padding: "11px 16px",
                    border: "1.5px solid",
                    borderColor: currentQuestion.bloomsLevel === level ? "rgba(91, 110, 232, 0.6)" : "rgba(91, 110, 232, 0.2)",
                    background: currentQuestion.bloomsLevel === level ? "rgba(91, 110, 232, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: currentQuestion.bloomsLevel === level ? 600 : 500,
                    color: currentQuestion.bloomsLevel === level ? "#fff" : "rgba(255, 255, 255, 0.6)",
                    transition: "all 0.2s",
                    fontSize: 13,
                  }}
                  onMouseEnter={(e) => {
                    if (currentQuestion.bloomsLevel !== level) {
                      e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.35)";
                      e.currentTarget.style.background = "rgba(91, 110, 232, 0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentQuestion.bloomsLevel !== level) {
                      e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.2)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    }
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 10, fontSize: 14, color: "rgba(255, 255, 255, 0.8)" }}>Question</label>
            <textarea
              value={currentQuestion.text}
              onChange={(e) => handleQuestionChange("text", e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid rgba(91, 110, 232, 0.2)",
                borderRadius: 10,
                fontSize: 15,
                fontFamily: "inherit",
                minHeight: 110,
                resize: "vertical",
                background: "rgba(255, 255, 255, 0.03)",
                color: "#fff",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.5)";
                e.currentTarget.style.background = "rgba(91, 110, 232, 0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.2)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 12, fontSize: 14, color: "rgba(255, 255, 255, 0.8)" }}>Options</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      minWidth: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: idx === currentQuestion.correctAnswer 
                        ? "linear-gradient(135deg, #51CF66, #40C057)" 
                        : "rgba(255, 255, 255, 0.08)",
                      color: idx === currentQuestion.correctAnswer ? "#fff" : "rgba(255, 255, 255, 0.5)",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      userSelect: "none",
                      border: idx === currentQuestion.correctAnswer 
                        ? "1px solid rgba(81, 207, 102, 0.5)" 
                        : "1px solid rgba(91, 110, 232, 0.2)",
                      transition: "all 0.2s",
                    }}
                    onClick={() => handleQuestionChange("correctAnswer", idx)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = idx === currentQuestion.correctAnswer 
                        ? "linear-gradient(135deg, #51CF66, #40C057)" 
                        : "rgba(91, 110, 232, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = idx === currentQuestion.correctAnswer 
                        ? "linear-gradient(135deg, #51CF66, #40C057)" 
                        : "rgba(255, 255, 255, 0.08)";
                    }}
                    title="Click to mark as correct answer"
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...currentQuestion.options]
                      newOptions[idx] = e.target.value
                      handleQuestionChange("options", newOptions)
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      border: "1px solid rgba(91, 110, 232, 0.2)",
                      borderRadius: 10,
                      fontSize: 14,
                      background: "rgba(255, 255, 255, 0.03)",
                      color: "#fff",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.5)";
                      e.currentTarget.style.background = "rgba(91, 110, 232, 0.05)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.2)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.4)", marginTop: 10 }}>
              👆 Click the letter to mark the correct answer
            </p>
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 10, fontSize: 14, color: "rgba(255, 255, 255, 0.8)" }}>
              Explanation (Optional)
            </label>
            <textarea
              value={currentQuestion.explanation || ""}
              onChange={(e) => handleQuestionChange("explanation", e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid rgba(91, 110, 232, 0.2)",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "inherit",
                minHeight: 90,
                resize: "vertical",
                background: "rgba(255, 255, 255, 0.03)",
                color: "#fff",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.5)";
                e.currentTarget.style.background = "rgba(91, 110, 232, 0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.2)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
              placeholder="Explain why this answer is correct..."
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button
              onClick={handleRegenerateQuestion}
              disabled={isRegenerating}
              style={{
                padding: "12px 20px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(91, 110, 232, 0.25)",
                borderRadius: 10,
                cursor: isRegenerating ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14,
                color: "#fff",
                opacity: isRegenerating ? 0.5 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isRegenerating) {
                  e.currentTarget.style.background = "rgba(91, 110, 232, 0.15)";
                  e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isRegenerating) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.25)";
                }
              }}
            >
              {isRegenerating ? "⏳ Regenerating..." : "🔄 Regenerate"}
            </button>

            <button
              onClick={handleSaveQuestion}
              disabled={isRegenerating}
              style={{
                flex: 1,
                padding: "12px 20px",
                background: isRegenerating 
                  ? "rgba(91, 110, 232, 0.4)" 
                  : "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                cursor: isRegenerating ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.2s",
                boxShadow: isRegenerating ? "none" : "0 4px 12px rgba(91, 110, 232, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!isRegenerating) {
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(91, 110, 232, 0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isRegenerating) {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(91, 110, 232, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? "✓ Finish & Review" : "→ Save & Next"}
            </button>
          </div>
        </div>

        {/* Save Quiz Dialog */}
        {showSaveDialog && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)",
                border: "1px solid rgba(91, 110, 232, 0.25)",
                borderRadius: 16,
                padding: 40,
                maxWidth: 420,
                width: "100%",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                color: "#fff",
              }}
            >
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>✓ Quiz Complete!</h2>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: 28, lineHeight: 1.6 }}>
                All questions have been refined. Name your quiz and save it to your library.
              </p>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid rgba(91, 110, 232, 0.25)",
                  borderRadius: 10,
                  marginBottom: 24,
                  fontSize: 14,
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.5)";
                  e.currentTarget.style.background = "rgba(91, 110, 232, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.25)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
                placeholder="Enter quiz title..."
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(91, 110, 232, 0.25)",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#fff",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(91, 110, 232, 0.15)";
                    e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.25)";
                  }}
                >
                  Keep Editing
                </button>
                <button
                  onClick={handleSaveQuiz}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #51CF66, #40C057)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    boxShadow: "0 4px 12px rgba(81, 207, 102, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(81, 207, 102, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(81, 207, 102, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  💾 Save Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
