"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  getQuizForEvaluation,
  getEvaluation,
  type QuizForEvaluation,
  type SavedEvaluation,
  type CognitiveLevel,
} from "@/lib/evaluation-service"
import { ArrowLeft, FileText, CheckCircle, AlertCircle } from "lucide-react"

const COGNITIVE_LEVELS: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

const COGNITIVE_LEVEL_COLORS: Record<CognitiveLevel, string> = {
  Remember: "#22c55e",
  Understand: "#3b82f6",
  Apply: "#8b5cf6",
  Analyze: "#f59e0b",
  Evaluate: "#ef4444",
  Create: "#ec4899",
}

export default function EvaluationViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [quiz, setQuiz] = useState<QuizForEvaluation | null>(null)
  const [evaluation, setEvaluation] = useState<SavedEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isEvaluator = sessionStorage.getItem("isEvaluator")
    if (!isEvaluator) {
      router.push("/evaluator/login")
      return
    }

    loadData()
  }, [id, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [quizData, evalData] = await Promise.all([
        getQuizForEvaluation(id),
        getEvaluation(id),
      ])
      setQuiz(quizData)
      setEvaluation(evalData)
    } catch (err) {
      setError("Failed to load evaluation data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-700 text-xl">Loading evaluation...</div>
      </div>
    )
  }

  if (!quiz || !evaluation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 text-xl mb-4">Evaluation not found</p>
          <Button onClick={() => router.push("/evaluator/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalQuestions = evaluation.questionEvaluations.length
  const averageScore = totalQuestions > 0
    ? (evaluation.questionEvaluations.reduce((sum, e) => sum + e.alignmentScore, 0) / totalQuestions).toFixed(2)
    : 0

  const scoreDistribution = [1, 2, 3, 4, 5].map(score => ({
    score,
    count: evaluation.questionEvaluations.filter(e => e.alignmentScore === score).length,
  }))

  const levelDistribution = COGNITIVE_LEVELS.map(level => ({
    level,
    aiAssigned: quiz.questions.filter(q => q.cognitiveLevel === level).length,
    evaluatorSuggested: evaluation.questionEvaluations.filter(e => e.suggestedLevel === level).length,
  }))

  const alignmentCount = evaluation.questionEvaluations.filter((e, i) => {
    const question = quiz.questions[i]
    return question?.cognitiveLevel === e.suggestedLevel
  }).length

  const alignmentPercentage = totalQuestions > 0 
    ? Math.round((alignmentCount / totalQuestions) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#5B6EE8] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/evaluator/dashboard")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-white/30" />
            <div>
              <h1 className="font-semibold">Evaluation Summary</h1>
              <p className="text-sm text-white/80">{quiz.fileName}</p>
            </div>
          </div>
          <div className="text-sm text-white/80">
            Evaluated on {evaluation.evaluatedAt.toLocaleDateString()} by {evaluation.evaluatorName}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-4xl font-bold text-[#5B6EE8]">{totalQuestions}</p>
            <p className="text-sm text-gray-600 mt-1">Questions Evaluated</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-4xl font-bold text-[#5B6EE8]">{averageScore}</p>
            <p className="text-sm text-gray-600 mt-1">Average Alignment Score</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-4xl font-bold text-green-600">{alignmentPercentage}%</p>
            <p className="text-sm text-gray-600 mt-1">Level Match Rate</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center capitalize">
            <p className="text-4xl font-bold text-amber-600">{quiz.difficulty}</p>
            <p className="text-sm text-gray-600 mt-1">Quiz Difficulty</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alignment Score Distribution</h3>
            <div className="space-y-3">
              {scoreDistribution.map(({ score, count }) => {
                const percentage = totalQuestions > 0 ? (count / totalQuestions) * 100 : 0
                return (
                  <div key={score} className="flex items-center gap-4">
                    <span className="w-8 text-sm font-medium text-gray-700">{score}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-[#5B6EE8] transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(percentage, count > 0 ? 15 : 0)}%` }}
                      >
                        {count > 0 && <span className="text-xs text-white font-medium">{count}</span>}
                      </div>
                    </div>
                    <span className="w-12 text-sm text-gray-500 text-right">{percentage.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t">
              <span>1 = Poor alignment</span>
              <span>5 = Perfect alignment</span>
            </div>
          </div>

          {/* Cognitive Level Comparison */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cognitive Level Distribution</h3>
            <div className="space-y-3">
              {levelDistribution.map(({ level, aiAssigned, evaluatorSuggested }) => (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-20 text-sm font-medium text-gray-700">{level}</span>
                  <div className="flex-1 flex gap-1">
                    <div
                      className="h-6 rounded-l flex items-center justify-center text-xs text-white font-medium"
                      style={{
                        width: `${Math.max((aiAssigned / totalQuestions) * 100, aiAssigned > 0 ? 15 : 0)}%`,
                        backgroundColor: COGNITIVE_LEVEL_COLORS[level],
                        opacity: 0.7,
                      }}
                    >
                      {aiAssigned > 0 && aiAssigned}
                    </div>
                    <div
                      className="h-6 rounded-r flex items-center justify-center text-xs text-white font-medium"
                      style={{
                        width: `${Math.max((evaluatorSuggested / totalQuestions) * 100, evaluatorSuggested > 0 ? 15 : 0)}%`,
                        backgroundColor: COGNITIVE_LEVEL_COLORS[level],
                      }}
                    >
                      {evaluatorSuggested > 0 && evaluatorSuggested}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-xs text-gray-500 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#5B6EE8] opacity-70"></div>
                <span>AI Assigned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#5B6EE8]"></div>
                <span>Evaluator Suggested</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Question-by-Question Evaluation</h3>
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const evalData = evaluation.questionEvaluations[index]
              const isAligned = question.cognitiveLevel === evalData?.suggestedLevel

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#5B6EE8] text-white flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          AI: {question.cognitiveLevel || "Not specified"}
                        </span>
                        {evalData && (
                          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                            isAligned 
                              ? "bg-green-100 text-green-700" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            Evaluator: {evalData.suggestedLevel}
                          </span>
                        )}
                      </div>
                    </div>
                    {evalData && (
                      <div className="flex items-center gap-2">
                        {isAligned ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        )}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <div
                              key={score}
                              className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                                evalData.alignmentScore === score
                                  ? "bg-[#5B6EE8] text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {score}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-gray-900 font-medium mb-3">{question.question}</p>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {question.options.map((option, optIndex) => {
                      const isCorrect = question.correctAnswers.includes(optIndex)
                      return (
                        <div
                          key={optIndex}
                          className={`text-sm p-2 rounded ${
                            isCorrect
                              ? "bg-green-50 text-green-800 border border-green-200"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                        </div>
                      )
                    })}
                  </div>

                  {/* Notes */}
                  {evalData?.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Evaluator Notes:</p>
                      <p className="text-sm text-gray-700">{evalData.notes}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
