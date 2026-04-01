"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import { FileText, Clock, ChevronRight, LogOut } from "lucide-react"

export default function EvaluatorDashboard() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizForEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if evaluator is logged in
    const isEvaluator = sessionStorage.getItem("isEvaluator")
    if (!isEvaluator) {
      router.push("/evaluator/login")
      return
    }

    loadQuizzes()
  }, [router])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const data = await getQuizzesForEvaluation()
      setQuizzes(data)
    } catch (err) {
      setError("Failed to load quizzes")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("isEvaluator")
    sessionStorage.removeItem("evaluatorName")
    router.push("/evaluator/login")
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700"
      case "moderate":
        return "bg-yellow-100 text-yellow-700"
      case "hard":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "evaluated":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Evaluated</span>
      case "pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#5B6EE8] flex items-center justify-center">
        <div className="text-white text-xl">Loading quizzes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#5B6EE8] text-white py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Evaluator Dashboard</h1>
            <p className="text-white/80 mt-1">
              Welcome, {sessionStorage.getItem("evaluatorName") || "Evaluator"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-transparent border-white text-white hover:bg-white hover:text-[#5B6EE8]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quizzes for Evaluation</h2>
          <p className="text-gray-600 mt-1">
            Evaluate each quiz to check if questions align with Anderson & Krathwohl taxonomy
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No quizzes to evaluate</h3>
            <p className="text-gray-500 mt-2">
              Quizzes will appear here once students generate them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{quiz.fileName}</h3>
                      {getStatusBadge(quiz.evaluationStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {quiz.questionCount} questions
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(quiz.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`/evaluator/evaluate/${quiz.id}`)}
                    className="bg-[#5B6EE8] hover:bg-[#4a5cd6] text-white"
                  >
                    {quiz.evaluationStatus === "evaluated" ? "View Evaluation" : "Evaluate"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
