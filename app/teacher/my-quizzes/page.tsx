"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getUserRole } from "@/lib/auth-service"
import { getTeacherFiles, type TeacherFile } from "@/lib/teacher-file-service"
import { getTeacherFileQuizzes, deleteTeacherQuiz, type TeacherQuiz } from "@/lib/teacher-quiz-service"

interface QuizWithFile {
  quiz: TeacherQuiz
  file: TeacherFile
}

export default function MyQuizzesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [quizzesWithFiles, setQuizzesWithFiles] = useState<QuizWithFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedFile, setExpandedFile] = useState<string | null>(null)

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

  // Load all quizzes grouped by file
  useEffect(() => {
    if (!user || userRole !== "teacher") return

    const loadQuizzes = async () => {
      try {
        setIsLoading(true)
        const teacherFiles = await getTeacherFiles()

        const allQuizzes: QuizWithFile[] = []

        // Load quizzes for each file
        for (const file of teacherFiles) {
          const fileQuizzes = await getTeacherFileQuizzes(file.id)
          fileQuizzes.forEach((quiz) => {
            allQuizzes.push({ quiz, file })
          })
        }

        // Sort by most recently edited
        allQuizzes.sort((a, b) => b.quiz.lastEdited.getTime() - a.quiz.lastEdited.getTime())

        setQuizzesWithFiles(allQuizzes)
      } catch (error) {
        console.error("[v0] Error loading quizzes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuizzes()
  }, [user, userRole])

  const handleDeleteQuiz = async (fileId: string, quizId: string) => {
    if (!confirm("Delete this quiz?")) return

    try {
      await deleteTeacherQuiz(fileId, quizId)
      setQuizzesWithFiles(quizzesWithFiles.filter((q) => q.quiz.id !== quizId))
    } catch (error) {
      console.error("[v0] Error deleting quiz:", error)
    }
  }

  // Group quizzes by file
  const groupedByFile = quizzesWithFiles.reduce(
    (acc, item) => {
      const fileId = item.file.id
      if (!acc[fileId]) {
        acc[fileId] = { file: item.file, quizzes: [] }
      }
      acc[fileId].quizzes.push(item.quiz)
      return acc
    },
    {} as Record<string, { file: TeacherFile; quizzes: TeacherQuiz[] }>
  )

  if (authLoading || isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <Link href="/teacher/dashboard" style={{ color: "#5B6EE8", textDecoration: "none", marginBottom: 8 }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>My Quizzes</h1>
            <p style={{ color: "#666", marginTop: 4 }}>View and manage all your saved quizzes</p>
          </div>
        </div>

        {/* Empty State */}
        {quizzesWithFiles.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px dashed #ccc",
              borderRadius: 12,
              padding: 60,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 16, color: "#999", marginBottom: 20 }}>No quizzes yet</p>
            <Link
              href="/teacher/dashboard"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "#5B6EE8",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          /* Quizzes Grouped by File */
          <div>
            {Object.entries(groupedByFile).map(([fileId, { file, quizzes }]) => (
              <div key={fileId} style={{ marginBottom: 32 }}>
                {/* File Header */}
                <div
                  onClick={() => setExpandedFile(expandedFile === fileId ? null : fileId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "#e8ecff",
                    borderRadius: 8,
                    cursor: "pointer",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                      {file.displayName || file.fileName}
                    </h3>
                    <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0" }}>
                      {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} created
                    </p>
                  </div>
                  <div style={{ fontSize: 20 }}>{expandedFile === fileId ? "−" : "+"}</div>
                </div>

                {/* Quizzes for this file */}
                {expandedFile === fileId && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        style={{
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: 8,
                          padding: 20,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>
                            {quiz.title}
                          </h4>
                          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#666" }}>
                            <div>📊 {quiz.metadata.questionCount} questions</div>
                            <div>📈 {quiz.metadata.difficulty}</div>
                            <div>💾 {quiz.metadata.status === "saved" ? "Saved" : "Draft"}</div>
                          </div>
                          <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                            Last edited: {quiz.lastEdited.toLocaleDateString()}
                          </div>

                          {/* Bloom's distribution mini-chart */}
                          <div style={{ marginTop: 12, display: "flex", gap: 4 }}>
                            {(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const).map((level) => {
                              const count = quiz.metadata.overallBloomsDistribution[level]?.total || 0
                              const percentage =
                                quiz.metadata.questionCount > 0 ? (count / quiz.metadata.questionCount) * 100 : 0

                              const colors: Record<string, string> = {
                                Remember: "#7f9fff",
                                Understand: "#5dade2",
                                Apply: "#58d68d",
                                Analyze: "#f8c471",
                                Evaluate: "#eb984e",
                                Create: "#f1948a",
                              }

                              return (
                                <div
                                  key={level}
                                  title={`${level}: ${count} question${count !== 1 ? "s" : ""}`}
                                  style={{
                                    flex: 1,
                                    height: 24,
                                    background: colors[level],
                                    borderRadius: 2,
                                    opacity: percentage > 0 ? 1 : 0.2,
                                  }}
                                />
                              )
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                          <Link
                            href={`/teacher/my-quizzes/${quiz.id}`}
                            style={{
                              padding: "8px 16px",
                              background: "#5B6EE8",
                              color: "#fff",
                              borderRadius: 6,
                              textDecoration: "none",
                              fontSize: 13,
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                            }}
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteQuiz(fileId, quiz.id)}
                            style={{
                              padding: "8px 16px",
                              background: "#f0f0f0",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#d32f2f",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
