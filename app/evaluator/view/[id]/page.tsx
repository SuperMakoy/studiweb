"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
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
      <div className="flex h-screen bg-slate-50">
        <EvaluatorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-700 text-xl">Loading evaluation...</div>
        </div>
      </div>
    )
  }

  if (!quiz || !evaluation) {
    return (
      <div className="flex h-screen bg-slate-50">
        <EvaluatorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-700 text-xl mb-4">Evaluation not found</p>
            <Button onClick={() => router.push("/evaluator/dashboard")}>Back to Dashboard</Button>
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
    <div className="flex h-screen bg-slate-50">
      <EvaluatorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/evaluator/dashboard")}
                className="text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <h1 className="font-semibold text-slate-800">{quiz.fileName}</h1>
                <p className="text-sm text-slate-500">Evaluation Results</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              Evaluated on {evaluation.evaluatedAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{totalQuestions}</p>
                  <p className="text-slate-500 text-sm">Total Questions</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{overallAverage.toFixed(1)}/5</p>
                  <p className="text-slate-500 text-sm">Overall Score</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{levelMatchRate.toFixed(0)}%</p>
                  <p className="text-slate-500 text-sm">Level Match Rate</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold capitalize text-sm">{quiz.difficulty.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 capitalize">{quiz.difficulty}</p>
                  <p className="text-slate-500 text-sm">Difficulty</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Rubric Criteria Averages */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Rubric Criteria Averages</h3>
              <div className="space-y-4">
                {(Object.keys(rubricAverages) as (keyof RubricCriteria)[]).map((key) => {
                  const avg = rubricAverages[key]
                  const percentage = (avg / 5) * 100
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">{RUBRIC_LABELS[key]}</span>
                        <span className="text-sm font-bold text-slate-800">{avg.toFixed(2)}/5</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            avg >= 4 ? "bg-emerald-500" : avg >= 3 ? "bg-amber-500" : "bg-rose-500"
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
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Score Distribution</h3>
              <div className="flex items-end gap-3 h-40">
                {[1, 2, 3, 4, 5].map((score) => {
                  const count = scoreDistribution[score]
                  const maxCount = Math.max(...Object.values(scoreDistribution), 1)
                  const heightPercent = (count / maxCount) * 100
                  return (
                    <div key={score} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-32">
                        <span className="text-sm font-bold text-slate-700 mb-1">{count}</span>
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            score >= 4 ? "bg-emerald-500" : score === 3 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ height: `${heightPercent}%`, minHeight: count > 0 ? "8px" : "0" }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 mt-2">{score}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-center text-xs text-slate-500 mt-3">Overall Alignment Score</p>
            </div>
          </div>

          {/* Cognitive Level Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Cognitive Level Comparison (AI vs Evaluator)</h3>
            <div className="grid grid-cols-6 gap-4">
              {COGNITIVE_LEVELS.map((level) => (
                <div key={level} className="text-center">
                  <p className="text-xs font-medium text-slate-600 mb-2">{level}</p>
                  <div className="flex justify-center gap-2">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-1">
                        <span className="text-blue-700 font-bold">{aiLevelCounts[level]}</span>
                      </div>
                      <span className="text-xs text-slate-500">AI</span>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-1">
                        <span className="text-emerald-700 font-bold">{evaluatorLevelCounts[level]}</span>
                      </div>
                      <span className="text-xs text-slate-500">Eval</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question-by-Question Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Question-by-Question Breakdown</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {quiz.questions.map((question, index) => {
                const qEval = evaluation.questionEvaluations[index]
                const levelMatch = question.cognitiveLevel === qEval?.suggestedLevel
                return (
                  <div key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-slate-700 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 font-medium mb-3">{question.question}</p>
                        
                        {/* Rubric Scores */}
                        {qEval?.rubricScores && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            {(Object.keys(RUBRIC_LABELS) as (keyof RubricCriteria)[]).map((key) => (
                              <div key={key} className="bg-slate-50 rounded-lg p-2 text-center">
                                <p className="text-xs text-slate-500">{RUBRIC_LABELS[key]}</p>
                                <p className="text-lg font-bold text-slate-800">{qEval.rubricScores?.[key] || 0}/5</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                            AI: {question.cognitiveLevel || "N/A"}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                            Evaluator: {qEval?.suggestedLevel || "N/A"}
                          </span>
                          {levelMatch ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" />
                              Match
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600">
                              <AlertTriangle className="w-4 h-4" />
                              Mismatch
                            </span>
                          )}
                          <span className="text-slate-600">
                            Overall Score: <strong>{qEval?.alignmentScore || 0}/5</strong>
                          </span>
                        </div>
                        
                        {qEval?.notes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs font-medium text-slate-500 mb-1">Evaluator Notes:</p>
                            <p className="text-sm text-slate-700">{qEval.notes}</p>
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
