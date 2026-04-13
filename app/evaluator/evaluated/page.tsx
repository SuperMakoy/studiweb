"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"
import { FileText, Clock, Loader2, CheckCircle2, ArrowRight } from "lucide-react"

export default function EvaluatedQuizzesPage() {
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
      setQuizzes(data.filter(q => q.evaluationStatus === "evaluated"))
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
    })
  }

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "moderate":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "hard":
        return "bg-rose-50 text-rose-700 border-rose-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
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
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900">Evaluated Quizzes</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                Completed evaluations and results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-gray-900">{quizzes.length}</p>
                <p className="text-gray-500 text-xs">Completed</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {error && (
            <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {quizzes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900">No evaluated quizzes yet</h3>
              <p className="text-gray-500 text-sm mt-2">
                Complete evaluations to see them here
              </p>
              <Button
                onClick={() => router.push("/evaluator/pending")}
                className="mt-4 bg-[#5B6EE8] hover:bg-[#4A5AC9] text-white"
              >
                View Pending Quizzes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => router.push(`/evaluator/view/${quiz.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
                >
                  {/* Status & Difficulty */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Evaluated
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${getDifficultyStyles(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                  </div>

                  {/* Quiz Info */}
                  <h3 className="font-semibold text-gray-900 text-base mb-2 truncate group-hover:text-emerald-600 transition-colors">
                    {quiz.fileName}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {quiz.questionCount} questions
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(quiz.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:text-emerald-700">
                      View Results
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
