"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"
import { FileText, Clock, ChevronRight, Upload, Loader2, ClipboardCheck } from "lucide-react"

type Difficulty = "easy" | "moderate" | "hard"

export default function EvaluatorDashboard() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizForEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>("moderate")
  const [questionCount, setQuestionCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = [
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!validTypes.includes(file.type)) {
      setGenerateError("Only TXT and DOC/DOCX files are supported")
      return
    }

    const maxSize = 1 * 1024 * 1024
    if (file.size > maxSize) {
      setGenerateError("File size must be less than 1MB")
      return
    }

    setUploadedFile(file)
    setGenerateError(null)
  }

  const handleGenerateQuiz = async () => {
    if (!uploadedFile) return

    setGenerating(true)
    setGenerateError(null)

    try {
      const content = await uploadedFile.text()

      const response = await fetch("/api/generate-quiz-from-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: `eval-${Date.now()}`,
          userId: "evaluator",
          fileName: uploadedFile.name,
          difficulty,
          length: questionCount,
          content,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate quiz")
      }

      await loadQuizzes()
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: any) {
      setGenerateError(err.message || "Failed to generate quiz")
      console.error(err)
    } finally {
      setGenerating(false)
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
        return "bg-slate-100 text-slate-700"
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
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900">Evaluator Dashboard</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                Anderson & Krathwohl Taxonomy Evaluation
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {/* Generate Quiz Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 md:mb-8">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Generate Quiz for Evaluation</h2>
              <p className="text-gray-500 text-xs md:text-sm">
                Upload a document to generate a quiz and evaluate its taxonomy alignment
              </p>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {/* File Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-8 text-center cursor-pointer hover:border-[#5B6EE8] hover:bg-[#5B6EE8]/5 transition-all"
                  >
                    <Upload className="w-8 h-8 md:w-10 md:h-10 mx-auto text-gray-400 mb-3" />
                    {uploadedFile ? (
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base">{uploadedFile.name}</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-700 text-sm md:text-base">Click to upload a file</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">TXT, DOC, DOCX (max 1MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4 md:space-y-5">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                    <div className="flex gap-2">
                      {(["easy", "moderate", "hard"] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`flex-1 py-2 md:py-2.5 px-3 md:px-4 rounded-lg font-medium capitalize text-xs md:text-sm transition ${
                            difficulty === d
                              ? "bg-[#5B6EE8] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions: <span className="text-[#5B6EE8] font-semibold">{questionCount}</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5B6EE8]"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10</span>
                      <span>50</span>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={!uploadedFile || generating}
                    className="w-full bg-[#5B6EE8] hover:bg-[#4A5AC9] text-white py-2.5 md:py-3"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="w-4 h-4 mr-2" />
                        Generate Quiz
                      </>
                    )}
                  </Button>

                  {generateError && (
                    <p className="text-red-600 text-sm">{generateError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Quizzes for Evaluation</h2>
              <p className="text-gray-500 text-xs md:text-sm">
                Review and evaluate quizzes for taxonomy alignment
              </p>
            </div>

            {error && (
              <div className="mx-4 md:mx-6 mt-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {quizzes.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900">No quizzes to evaluate</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Generate a quiz above to start evaluating
                </p>
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
