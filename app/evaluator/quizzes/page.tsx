"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"
import { FileText, Clock, ChevronRight, Loader2 } from "lucide-react"

export default function AllQuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizForEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
        return "bg-emerald-100 text-emerald-700"
      case "moderate":
        return "bg-amber-100 text-amber-700"
      case "hard":
        return "bg-rose-100 text-rose-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="md:flex h-screen bg-gray-50">
        <EvaluatorMobileHeader />
        <EvaluatorSidebar />
        <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
          <Loader2 className="w-8 h-8 animate-spin text-[#5B6EE8]" />
        </div>
      </div>
    )
  }

  return (
    <div className="md:flex h-screen bg-gray-50">
      <EvaluatorMobileHeader />
      <EvaluatorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900">All Quizzes</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                View and manage all generated quizzes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#5B6EE8]/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#5B6EE8]" />
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-gray-900">{quizzes.length}</p>
                <p className="text-gray-500 text-xs">Total</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {error && (
              <div className="mx-4 md:mx-6 mt-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {quizzes.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900">No quizzes yet</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Generate a quiz from the dashboard to get started
                </p>
                <Button
                  onClick={() => router.push("/evaluator/dashboard")}
                  className="mt-4 bg-[#5B6EE8] hover:bg-[#4A5AC9] text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{quiz.fileName}</h3>
                          {quiz.evaluationStatus === "evaluated" ? (
                            <span className="px-2 py-0.5 md:px-2.5 md:py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                              Evaluated
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 md:px-2.5 md:py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1 md:gap-1.5">
                            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {quiz.questionCount} questions
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                          </span>
                          <span className="flex items-center gap-1 md:gap-1.5">
                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {formatDate(quiz.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(
                          quiz.evaluationStatus === "evaluated" 
                            ? `/evaluator/view/${quiz.id}` 
                            : `/evaluator/evaluate/${quiz.id}`
                        )}
                        className={`w-full md:w-auto text-sm ${
                          quiz.evaluationStatus === "evaluated" 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-[#5B6EE8] hover:bg-[#4A5AC9] text-white"
                        }`}
                      >
                        {quiz.evaluationStatus === "evaluated" ? "View Results" : "Evaluate"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
