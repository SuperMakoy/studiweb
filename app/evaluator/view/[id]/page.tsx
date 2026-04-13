"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"
import {
  getQuizForEvaluation,
  getEvaluation,
  type QuizForEvaluation,
  type SavedEvaluation,
  type RubricCriteria,
} from "@/lib/evaluation-service"
import { ArrowLeft, FileText, Clock, CheckCircle2, AlertTriangle, BarChart3 } from "lucide-react"

type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

const COGNITIVE_LEVELS: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

const RUBRIC_LABELS: Record<keyof RubricCriteria, string> = {
  verbAlignment: "Verb Alignment",
  cognitiveComplexity: "Cognitive Complexity",
  questionClarity: "Question Clarity",
  topicRelevance: "Topic Relevance",
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
      <div className="md:flex h-screen bg-gray-50">
        <EvaluatorMobileHeader />
        <EvaluatorSidebar />
        <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
          <div className="text-gray-700 text-xl">Loading evaluation...</div>
        </div>
      </div>
    )
  }

  if (!quiz || !evaluation) {
    return (
      <div className="md:flex h-screen bg-gray-50">
        <EvaluatorMobileHeader />
        <EvaluatorSidebar />
        <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
          <div className="text-center">
            <p className="text-gray-700 text-xl mb-4">Evaluation not found</p>
            <Button onClick={() => router.push("/evaluator/dashboard")} className="bg-[#5B6EE8] hover:bg-[#4A5AC9] text-white">Back to Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalQuestions = evaluation.questionEvaluations.length
  
  // Calculate average scores for each rubric criterion
  const rubricAverages: Record<keyof RubricCriteria, number> = {
    verbAlignment: 0,
    cognitiveComplexity: 0,
    questionClarity: 0,
    topicRelevance: 0,
  }

  let overallSum = 0
  let levelMatchCount = 0

  evaluation.questionEvaluations.forEach((qe, index) => {
    const question = quiz.questions[index]
    if (qe.rubricScores) {
      rubricAverages.verbAlignment += qe.rubricScores.verbAlignment || 0
      rubricAverages.cognitiveComplexity += qe.rubricScores.cognitiveComplexity || 0
      rubricAverages.questionClarity += qe.rubricScores.questionClarity || 0
      rubricAverages.topicRelevance += qe.rubricScores.topicRelevance || 0
    }
    overallSum += qe.alignmentScore || 0
    if (question?.cognitiveLevel === qe.suggestedLevel) {
      levelMatchCount++
    }
  })

  // Calculate averages
  Object.keys(rubricAverages).forEach((key) => {
    rubricAverages[key as keyof RubricCriteria] = 
      totalQuestions > 0 ? rubricAverages[key as keyof RubricCriteria] / totalQuestions : 0
  })

  const overallAverage = totalQuestions > 0 ? overallSum / totalQuestions : 0
  const levelMatchRate = totalQuestions > 0 ? (levelMatchCount / totalQuestions) * 100 : 0

  // Count cognitive level distribution (AI vs Evaluator)
  const aiLevelCounts: Record<CognitiveLevel, number> = {
    Remember: 0, Understand: 0, Apply: 0, Analyze: 0, Evaluate: 0, Create: 0,
  }
  const evaluatorLevelCounts: Record<CognitiveLevel, number> = {
    Remember: 0, Understand: 0, Apply: 0, Analyze: 0, Evaluate: 0, Create: 0,
  }

  quiz.questions.forEach((q, index) => {
    if (q.cognitiveLevel) aiLevelCounts[q.cognitiveLevel]++
    const evalLevel = evaluation.questionEvaluations[index]?.suggestedLevel
    if (evalLevel) evaluatorLevelCounts[evalLevel]++
  })

  // Score distribution
  const scoreDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  evaluation.questionEvaluations.forEach((qe) => {
    const score = Math.round(qe.alignmentScore || 3)
    if (score >= 1 && score <= 5) scoreDistribution[score]++
  })

  return (
    <div className="md:flex h-screen bg-gray-50">
      <EvaluatorMobileHeader />
      <EvaluatorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/evaluator/dashboard")}
                className="text-gray-600 hover:text-gray-800 px-2 md:px-3"
              >
                <ArrowLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-200 hidden md:block" />
              <div>
                <h1 className="font-semibold text-gray-900 text-sm md:text-base truncate max-w-[150px] md:max-w-none">{quiz.fileName}</h1>
                <p className="text-xs md:text-sm text-gray-500">Evaluation Results</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {evaluation.evaluatedAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg mb-4 md:mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-200">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#5B6EE8]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#5B6EE8]" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{totalQuestions}</p>
                  <p className="text-gray-500 text-xs md:text-sm">Questions</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-200">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{overallAverage.toFixed(1)}/5</p>
                  <p className="text-gray-500 text-xs md:text-sm">Score</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-200">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{levelMatchRate.toFixed(0)}%</p>
                  <p className="text-gray-500 text-xs md:text-sm">Match Rate</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-200">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#5B6EE8]/10 rounded-lg flex items-center justify-center">
                  <span className="text-[#5B6EE8] font-bold capitalize text-xs md:text-sm">{quiz.difficulty.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 capitalize">{quiz.difficulty}</p>
                  <p className="text-gray-500 text-xs md:text-sm">Difficulty</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Rubric Criteria Averages */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Rubric Criteria Averages</h3>
              <div className="space-y-3 md:space-y-4">
                {(Object.keys(rubricAverages) as (keyof RubricCriteria)[]).map((key) => {
                  const avg = rubricAverages[key]
                  const percentage = (avg / 5) * 100
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1 md:mb-1.5">
                        <span className="text-xs md:text-sm font-medium text-gray-700">{RUBRIC_LABELS[key]}</span>
                        <span className="text-xs md:text-sm font-bold text-gray-900">{avg.toFixed(2)}/5</span>
                      </div>
                      <div className="h-2 md:h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            avg >= 4 ? "bg-emerald-500" : avg >= 3 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Score Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Score Distribution</h3>
              <div className="flex items-end gap-2 md:gap-3 h-32 md:h-40">
                {[1, 2, 3, 4, 5].map((score) => {
                  const count = scoreDistribution[score]
                  const maxCount = Math.max(...Object.values(scoreDistribution), 1)
                  const heightPercent = (count / maxCount) * 100
                  return (
                    <div key={score} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-24 md:h-32">
                        <span className="text-xs md:text-sm font-bold text-gray-700 mb-1">{count}</span>
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            score >= 4 ? "bg-emerald-500" : score === 3 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ height: `${heightPercent}%`, minHeight: count > 0 ? "8px" : "0" }}
                        />
                      </div>
                      <span className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">{score}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-center text-xs text-gray-500 mt-2 md:mt-3">Overall Alignment Score</p>
            </div>
          </div>

          {/* Cognitive Level Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Cognitive Level Comparison (AI vs Evaluator)</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
              {COGNITIVE_LEVELS.map((level) => (
                <div key={level} className="text-center">
                  <p className="text-xs font-medium text-gray-600 mb-1 md:mb-2 truncate">{level}</p>
                  <div className="flex justify-center gap-1 md:gap-2">
                    <div className="text-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#5B6EE8]/10 flex items-center justify-center mb-0.5 md:mb-1">
                        <span className="text-[#5B6EE8] font-bold text-sm md:text-base">{aiLevelCounts[level]}</span>
                      </div>
                      <span className="text-xs text-gray-500">AI</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-0.5 md:mb-1">
                        <span className="text-emerald-700 font-bold text-sm md:text-base">{evaluatorLevelCounts[level]}</span>
                      </div>
                      <span className="text-xs text-gray-500">Eval</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question-by-Question Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Question-by-Question Breakdown</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {quiz.questions.map((question, index) => {
                const qEval = evaluation.questionEvaluations[index]
                const levelMatch = question.cognitiveLevel === qEval?.suggestedLevel
                return (
                  <div key={index} className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs md:text-sm font-medium text-gray-700 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium text-sm md:text-base mb-2 md:mb-3">{question.question}</p>
                        
                        {/* Rubric Scores */}
                        {qEval?.rubricScores && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-2 md:mb-3">
                            {(Object.keys(RUBRIC_LABELS) as (keyof RubricCriteria)[]).map((key) => (
                              <div key={key} className="bg-gray-50 rounded-lg p-1.5 md:p-2 text-center">
                                <p className="text-xs text-gray-500 truncate">{RUBRIC_LABELS[key]}</p>
                                <p className="text-base md:text-lg font-bold text-gray-900">{qEval.rubricScores?.[key] || 0}/5</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
                          <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-[#5B6EE8]/10 text-[#5B6EE8] font-medium">
                            AI: {question.cognitiveLevel || "N/A"}
                          </span>
                          <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                            Eval: {qEval?.suggestedLevel || "N/A"}
                          </span>
                          {levelMatch ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              Match
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600">
                              <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              Mismatch
                            </span>
                          )}
                          <span className="text-gray-600">
                            Score: <strong>{qEval?.alignmentScore || 0}/5</strong>
                          </span>
                        </div>
                        
                        {qEval?.notes && (
                          <div className="mt-2 md:mt-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-0.5 md:mb-1">Evaluator Notes:</p>
                            <p className="text-xs md:text-sm text-gray-700">{qEval.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
