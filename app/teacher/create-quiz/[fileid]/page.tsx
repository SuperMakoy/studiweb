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

    loadFileAndQuiz()
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
            }}
          >
            ← Back to Dashboard
          </Link>

          <div style={{ marginBottom: 48 }}>
            <h1 style={{
              fontSize: 36,
              fontWeight: 800,
              marginBottom: 12,
              letterSpacing: -0.5,
            }}>
              Generate Quiz
            </h1>
            <p style={{
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.5)",
            }}>
              From: {file.displayName || file.fileName}
            </p>
          </div>

          {error && (
            <div style={{
              background: "rgba(255, 107, 107, 0.12)",
              border: "1px solid rgba(255, 107, 107, 0.3)",
              color: "#ff6b6b",
              padding: "16px",
              borderRadius: 10,
              marginBottom: 32,
            }}>
              {error}
            </div>
          )}

          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(91, 110, 232, 0.2)",
            borderRadius: 14,
            padding: 32,
            backdropFilter: "blur(10px)",
          }}>
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 12,
                color: "rgba(255, 255, 255, 0.7)",
              }}>
                Number of Questions
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(5, Math.min(50, parseInt(e.target.value) || 10)))}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(91, 110, 232, 0.2)",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 12,
                color: "rgba(255, 255, 255, 0.7)",
              }}>
                Difficulty Level
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {(["easy", "moderate", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    style={{
                      flex: 1,
                      padding: "11px 16px",
                      background: difficulty === level
                        ? "linear-gradient(135deg, #5B6EE8, #7b5ea7)"
                        : "rgba(255, 255, 255, 0.08)",
                      border: difficulty === level
                        ? "1px solid rgba(91, 110, 232, 0.5)"
                        : "1px solid rgba(91, 110, 232, 0.2)",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s",
                      textTransform: "capitalize",
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
                  ? "rgba(91, 110, 232, 0.5)"
                  : "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.7 : 1,
                transition: "all 0.3s",
                boxShadow: isGenerating ? "none" : "0 6px 20px rgba(91, 110, 232, 0.4)",
              }}
            >
              {isGenerating ? "Generating..." : "Generate Quiz"}
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
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "40px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <Link href="/teacher/dashboard" style={{ color: "#5B6EE8", textDecoration: "none", marginBottom: 8 }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>Create Quiz</h1>
            <p style={{ color: "#666", marginTop: 4 }}>From: {file?.displayName || file?.fileName}</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div style={{ flex: 1, height: 8, background: "#e0e0e0", borderRadius: 4 }}>
              <div
                style={{
                  height: "100%",
                  background: "#5B6EE8",
                  borderRadius: 4,
                  width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "#ffebee",
                border: "1px solid #ffcdd2",
                color: "#c62828",
                padding: "12px 16px",
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Question Editor */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 32, marginBottom: 24 }}>
          {/* Bloom's Level Selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              Bloom&apos;s Cognitive Level
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
              {BLOOM_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleQuestionChange("bloomsLevel", level)}
                  style={{
                    padding: "10px 16px",
                    border: "2px solid",
                    borderColor: currentQuestion.bloomsLevel === level ? "#5B6EE8" : "#e0e0e0",
                    background: currentQuestion.bloomsLevel === level ? "#f0f2ff" : "#fff",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: currentQuestion.bloomsLevel === level ? 600 : 500,
                    color: currentQuestion.bloomsLevel === level ? "#5B6EE8" : "#666",
                    transition: "all 0.2s",
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Question</label>
            <textarea
              value={currentQuestion.text}
              onChange={(e) => handleQuestionChange("text", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e0e0e0",
                borderRadius: 6,
                fontSize: 16,
                fontFamily: "inherit",
                minHeight: 100,
                resize: "vertical",
              }}
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Options</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: idx === currentQuestion.correctAnswer ? "#51CF66" : "#f0f0f0",
                      color: idx === currentQuestion.correctAnswer ? "#fff" : "#999",
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => handleQuestionChange("correctAnswer", idx)}
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
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
              Click the letter badge to mark the correct answer
            </p>
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              Explanation (Optional)
            </label>
            <textarea
              value={currentQuestion.explanation || ""}
              onChange={(e) => handleQuestionChange("explanation", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e0e0e0",
                borderRadius: 6,
                fontSize: 14,
                fontFamily: "inherit",
                minHeight: 80,
                resize: "vertical",
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
                background: "#f0f0f0",
                border: "none",
                borderRadius: 6,
                cursor: isRegenerating ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14,
                opacity: isRegenerating ? 0.6 : 1,
              }}
            >
              {isRegenerating ? "Regenerating..." : "🔄 Regenerate Question"}
            </button>

            <button
              onClick={handleSaveQuestion}
              disabled={isRegenerating}
              style={{
                flex: 1,
                padding: "12px 20px",
                background: "#5B6EE8",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? "Finish & Review" : "Save & Next"}
            </button>
          </div>
        </div>

        {/* Save Quiz Dialog */}
        {showSaveDialog && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 32,
                maxWidth: 400,
                width: "100%",
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Save Your Quiz</h2>
              <p style={{ color: "#666", marginBottom: 20 }}>
                All questions completed! Name your quiz and save it to your library.
              </p>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 6,
                  marginBottom: 20,
                  fontSize: 14,
                }}
                placeholder="Quiz title..."
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "#f0f0f0",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Keep Editing
                </button>
                <button
                  onClick={handleSaveQuiz}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "#27ae60",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Save Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
