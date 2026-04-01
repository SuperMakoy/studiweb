"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  getQuizForEvaluation,
  saveEvaluation,
  type QuizForEvaluation,
  type QuestionEvaluation,
} from "@/lib/evaluation-service"
import { ArrowLeft, ArrowRight, Save, CheckCircle } from "lucide-react"

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
        // Initialize evaluations for each question
        const initialEvaluations: Record<number, QuestionEvaluation> = {}
        data.questions.forEach((q, index) => {
          initialEvaluations[index] = {
            questionId: q.id,
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

  const handleScoreChange = (score: number) => {
    setEvaluations((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        ...prev[currentQuestionIndex],
        alignmentScore: score,
      },
    }))
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-700 text-xl">Loading quiz...</div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 text-xl mb-4">Quiz not found</p>
          <Button onClick={() => router.push("/evaluator/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const currentEvaluation = evaluations[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#5B6EE8] text-white py-4 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/evaluator/dashboard")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-white/30" />
            <div>
              <h1 className="font-semibold">{quiz.fileName}</h1>
              <p className="text-sm text-white/80 capitalize">{quiz.difficulty} difficulty</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="outline"
              size="sm"
              className="bg-transparent border-white text-white hover:bg-white hover:text-[#5B6EE8]"
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Progress"}
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <main className="max-w-7xl mx-auto py-6 px-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Quiz Question */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
            <div className="mb-4">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#5B6EE8]/10 text-[#5B6EE8]">
                AI Assigned Level: {currentQuestion.cognitiveLevel || "Not specified"}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-6">{currentQuestion.question}</h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = currentQuestion.correctAnswers.includes(index)
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={isCorrect ? "text-green-900 font-medium" : "text-gray-700"}>
                        {option}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {currentQuestion.correctAnswers.length > 0 && (
              <p className="mt-4 text-sm text-gray-500">
                Correct answer: {currentQuestion.correctAnswers.map((i) => String.fromCharCode(65 + i)).join(", ")}
              </p>
            )}
          </div>

          {/* Right Side - Evaluation Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Evaluation</h3>

            {/* Cognitive Level Display */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Assigned Cognitive Level
              </label>
              <div className="p-3 bg-[#5B6EE8]/10 rounded-lg">
                <p className="font-semibold text-[#5B6EE8]">
                  {currentQuestion.cognitiveLevel || "Not specified"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {currentQuestion.cognitiveLevel
                    ? COGNITIVE_LEVEL_DESCRIPTIONS[currentQuestion.cognitiveLevel as CognitiveLevel]
                    : "No description available"}
                </p>
              </div>
            </div>

            {/* Alignment Score (1-5) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alignment Score (1-5)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                How well does this question align with the assigned cognitive level?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreChange(score)}
                    className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                      currentEvaluation?.alignmentScore === score
                        ? "bg-[#5B6EE8] text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Poor alignment</span>
                <span>Perfect alignment</span>
              </div>
            </div>

            {/* Suggested Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Suggested Cognitive Level
              </label>
              <p className="text-xs text-gray-500 mb-3">
                What level do you think this question actually tests?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {COGNITIVE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(level)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <Textarea
                value={currentEvaluation?.notes || ""}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add any comments or suggestions about this question..."
                rows={4}
                className="w-full resize-none"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? "bg-[#5B6EE8] text-white"
                    : evaluations[index]?.notes || evaluations[index]?.alignmentScore !== 3
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
              Finish & Save
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              disabled={currentQuestionIndex === quiz.questions.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
