"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"
import {
  getQuizForEvaluation,
  saveEvaluation,
  type QuizForEvaluation,
  type QuestionEvaluation,
  type RubricCriteria,
} from "@/lib/evaluation-service"
import { ArrowLeft, ArrowRight, Save, CheckCircle, Info } from "lucide-react"

type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

const COGNITIVE_LEVELS: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

const COGNITIVE_LEVEL_DESCRIPTIONS: Record<CognitiveLevel, string> = {
  Remember: "Recall facts and basic concepts (Define, List, Name, State, Identify)",
  Understand: "Explain ideas or concepts (Explain, Summarize, Describe, Interpret)",
  Apply: "Use information in new situations (Apply, Demonstrate, Solve, Use)",
  Analyze: "Draw connections among ideas (Compare, Contrast, Differentiate, Examine)",
  Evaluate: "Justify a decision or judgment (Justify, Critique, Defend, Judge)",
  Create: "Produce new or original work (Design, Propose, Construct, Combine)",
}

// Rubric criteria definitions with descriptions for each score
const RUBRIC_CRITERIA = [
  {
    key: "verbAlignment" as keyof RubricCriteria,
    label: "Verb Alignment",
    description: "Does the action verb in the question match the assigned cognitive level?",
    tooltip: "Check if verbs like 'define', 'analyze', 'evaluate' match the taxonomy level",
    scoreDescriptions: {
      1: "Completely misaligned verb",
      2: "Mostly misaligned",
      3: "Partially aligned",
      4: "Mostly aligned",
      5: "Perfect verb alignment",
    },
  },
  {
    key: "cognitiveComplexity" as keyof RubricCriteria,
    label: "Cognitive Complexity",
    description: "Does the question require the expected level of cognitive processing?",
    tooltip: "Higher levels require analysis, evaluation, or creation; lower levels require recall",
    scoreDescriptions: {
      1: "Wrong complexity level",
      2: "Too simple/complex",
      3: "Moderate match",
      4: "Good match",
      5: "Exact complexity match",
    },
  },
  {
    key: "questionClarity" as keyof RubricCriteria,
    label: "Question Clarity",
    description: "Is the question clearly written and unambiguous?",
    tooltip: "Students should understand what is being asked without confusion",
    scoreDescriptions: {
      1: "Very confusing",
      2: "Somewhat unclear",
      3: "Adequate clarity",
      4: "Clear",
      5: "Crystal clear",
    },
  },
  {
    key: "topicRelevance" as keyof RubricCriteria,
    label: "Topic Relevance",
    description: "Is the question relevant to the source content/topic?",
    tooltip: "The question should test knowledge from the actual learning material",
    scoreDescriptions: {
      1: "Not relevant",
      2: "Barely relevant",
      3: "Somewhat relevant",
      4: "Relevant",
      5: "Highly relevant",
    },
  },
]

export default function EvaluatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [quiz, setQuiz] = useState<QuizForEvaluation | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [evaluations, setEvaluations] = useState<Record<number, QuestionEvaluation>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const isEvaluator = sessionStorage.getItem("isEvaluator")
    if (!isEvaluator) {
      router.push("/evaluator/login")
      return
    }

    loadQuiz()
  }, [id, router])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const data = await getQuizForEvaluation(id)
      if (data) {
        setQuiz(data)
        // Initialize evaluations for each question with default rubric scores
        const initialEvaluations: Record<number, QuestionEvaluation> = {}
        data.questions.forEach((q, index) => {
          initialEvaluations[index] = {
            questionId: q.id,
            rubricScores: {
              verbAlignment: 3,
              cognitiveComplexity: 3,
              questionClarity: 3,
              topicRelevance: 3,
            },
            alignmentScore: 3,
            suggestedLevel: q.cognitiveLevel || "Remember",
            notes: "",
          }
        })
        setEvaluations(initialEvaluations)
      }
    } catch (err) {
      setError("Failed to load quiz")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRubricChange = (criterion: keyof RubricCriteria, score: number) => {
    setEvaluations((prev) => {
      const currentEval = prev[currentQuestionIndex]
      const newRubricScores = {
        ...currentEval.rubricScores,
        [criterion]: score,
      }
      // Calculate overall alignment as average of rubric scores
      const overallScore = Math.round(
        (newRubricScores.verbAlignment +
          newRubricScores.cognitiveComplexity +
          newRubricScores.questionClarity +
          newRubricScores.topicRelevance) / 4
      )
      return {
        ...prev,
        [currentQuestionIndex]: {
          ...currentEval,
          rubricScores: newRubricScores,
          alignmentScore: overallScore,
        },
      }
    })
  }

  const handleLevelChange = (level: CognitiveLevel) => {
    setEvaluations((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        ...prev[currentQuestionIndex],
        suggestedLevel: level,
      },
    }))
  }

  const handleNotesChange = (notes: string) => {
    setEvaluations((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        ...prev[currentQuestionIndex],
        notes,
      },
    }))
  }

  const handleSave = async () => {
    if (!quiz) return

    try {
      setSaving(true)
      const evaluatorName = sessionStorage.getItem("evaluatorName") || "Unknown"
      await saveEvaluation(id, Object.values(evaluations), evaluatorName)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError("Failed to save evaluation")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = async () => {
    await handleSave()
    router.push("/evaluator/dashboard")
  }

  if (loading) {
    return (
      <div className="md:flex h-screen bg-gray-50">
        <EvaluatorMobileHeader />
        <EvaluatorSidebar />
        <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
          <div className="text-gray-700 text-xl">Loading quiz...</div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="md:flex h-screen bg-gray-50">
        <EvaluatorMobileHeader />
        <EvaluatorSidebar />
        <div className="flex-1 flex items-center justify-center pt-14 md:pt-0">
          <div className="text-center">
            <p className="text-gray-700 text-xl mb-4">Quiz not found</p>
            <Button onClick={() => router.push("/evaluator/dashboard")} className="bg-[#5B6EE8] hover:bg-[#4A5AC9] text-white">Back to Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const currentEvaluation = evaluations[currentQuestionIndex]

  return (
    <div className="md:flex h-screen bg-gray-50">
      <EvaluatorMobileHeader />
      <EvaluatorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-2 md:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/evaluator/dashboard")}
              className="text-gray-600 hover:text-gray-800 px-2 md:px-3"
            >
              <ArrowLeft className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-gray-200 hidden md:block" />
            <div>
              <h1 className="font-semibold text-gray-900 text-sm md:text-base truncate max-w-[150px] md:max-w-none">{quiz.fileName}</h1>
              <p className="text-xs md:text-sm text-gray-500 capitalize">{quiz.difficulty} difficulty</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 justify-between md:justify-end">
            <span className="text-xs md:text-sm text-gray-600">
              Q {currentQuestionIndex + 1}/{quiz.questions.length}
            </span>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="outline"
              size="sm"
              className="text-xs md:text-sm"
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1 md:mr-2 text-emerald-600" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1 md:mr-2" />
                  {saving ? "Saving..." : "Save"}
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg mb-4 md:mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Left Side - Quiz Question */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 h-fit">
              <div className="mb-3 md:mb-4">
                <span className="text-xs font-medium px-2 md:px-2.5 py-1 rounded-full bg-[#5B6EE8]/10 text-[#5B6EE8]">
                  AI Assigned: {currentQuestion.cognitiveLevel || "Not specified"}
                </span>
              </div>

              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">{currentQuestion.question}</h2>

              <div className="space-y-2 md:space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isCorrect = currentQuestion.correctAnswers.includes(index)
                  return (
                    <div
                      key={index}
                      className={`p-3 md:p-4 rounded-lg border-2 ${
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <span
                          className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0 ${
                            isCorrect
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className={`text-sm md:text-base ${isCorrect ? "text-emerald-900 font-medium" : "text-gray-700"}`}>
                          {option}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {currentQuestion.correctAnswers.length > 0 && (
                <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-500">
                  Correct answer: {currentQuestion.correctAnswers.map((i) => String.fromCharCode(65 + i)).join(", ")}
                </p>
              )}
            </div>

            {/* Right Side - Evaluation Form with 4-Criteria Rubric */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Evaluation Rubric</h3>
                <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500">
                  <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Rate each criterion 1-5</span>
                  <span className="sm:hidden">1-5</span>
                </div>
              </div>

              {/* 4-Criteria Rubric */}
              <div className="space-y-4 md:space-y-6 mb-4 md:mb-6">
                {RUBRIC_CRITERIA.map((criterion) => (
                  <div key={criterion.key} className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-medium text-gray-900 text-sm md:text-base">{criterion.label}</h4>
                        <p className="text-xs text-gray-500 hidden sm:block">{criterion.description}</p>
                      </div>
                      <span className="text-base md:text-lg font-bold text-[#5B6EE8]">
                        {currentEvaluation?.rubricScores?.[criterion.key] || 3}
                      </span>
                    </div>
                    <div className="flex gap-1 md:gap-1.5 mt-2 md:mt-3">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => handleRubricChange(criterion.key, score)}
                          title={criterion.scoreDescriptions[score as 1|2|3|4|5]}
                          className={`flex-1 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                            currentEvaluation?.rubricScores?.[criterion.key] === score
                              ? "bg-[#5B6EE8] text-white shadow-sm"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center hidden sm:block">
                      {criterion.scoreDescriptions[currentEvaluation?.rubricScores?.[criterion.key] as 1|2|3|4|5 || 3]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Overall Score Display */}
              <div className="bg-[#5B6EE8]/10 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#5B6EE8] text-sm md:text-base">Overall Alignment Score</h4>
                    <p className="text-xs text-[#5B6EE8]/70">Average of all criteria</p>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-[#5B6EE8]">
                    {currentEvaluation?.alignmentScore || 3}/5
                  </div>
                </div>
              </div>

              {/* Suggested Level */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Suggested Cognitive Level
                </label>
                <p className="text-xs text-gray-500 mb-2 md:mb-3 hidden sm:block">
                  What level do you think this question actually tests?
                </p>
                <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                  {COGNITIVE_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => handleLevelChange(level)}
                      className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                        currentEvaluation?.suggestedLevel === level
                          ? "bg-[#5B6EE8] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Evaluator Notes</label>
                <Textarea
                  value={currentEvaluation?.notes || ""}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Add comments, suggestions, or observations about this question..."
                  rows={3}
                  className="w-full resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 md:mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className="text-xs md:text-sm px-2 md:px-4"
            >
              <ArrowLeft className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Previous</span>
            </Button>

            <div className="flex gap-1 md:gap-1.5 flex-wrap justify-center max-w-[180px] md:max-w-md overflow-hidden">
              {quiz.questions.map((_, index) => {
                const hasEvaluation = evaluations[index]?.notes || 
                  evaluations[index]?.alignmentScore !== 3 ||
                  evaluations[index]?.suggestedLevel !== quiz.questions[index].cognitiveLevel
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? "bg-[#5B6EE8] text-white"
                        : hasEvaluation
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-700 text-xs md:text-sm px-2 md:px-4">
                <span className="hidden md:inline">Finish & Save</span>
                <span className="md:hidden">Done</span>
                <CheckCircle className="w-4 h-4 md:ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                className="bg-[#5B6EE8] hover:bg-[#4A5AC9] text-xs md:text-sm px-2 md:px-4"
              >
                <span className="hidden md:inline">Next</span>
                <ArrowRight className="w-4 h-4 md:ml-2" />
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
