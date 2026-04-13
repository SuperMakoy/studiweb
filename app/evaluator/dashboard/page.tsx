"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"
import { FileText, Upload, Loader2, ClipboardCheck, AlertCircle, CheckCircle2 } from "lucide-react"

type Difficulty = "easy" | "moderate" | "hard"

export default function EvaluatorDashboard() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizForEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  
  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>("moderate")
  const [questionCount, setQuestionCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // Stats
  const pendingCount = quizzes.filter((q) => q.evaluationStatus === "pending").length
  const evaluatedCount = quizzes.filter((q) => q.evaluationStatus === "evaluated").length

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
          {/* Stats Cards - Clickable Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <button
              onClick={() => router.push("/evaluator/quizzes")}
              className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#5B6EE8]/30 transition-all text-left"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#5B6EE8]/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#5B6EE8]" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{quizzes.length}</p>
                  <p className="text-gray-500 text-xs md:text-sm">Total Quizzes</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => router.push("/evaluator/pending")}
              className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-left"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{pendingCount}</p>
                  <p className="text-gray-500 text-xs md:text-sm">Pending Review</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => router.push("/evaluator/evaluated")}
              className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{evaluatedCount}</p>
                  <p className="text-gray-500 text-xs md:text-sm">Evaluated</p>
                </div>
              </div>
            </button>
          </div>

          {/* Generate Quiz Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
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
        </main>
      </div>
    </div>
  )
}
