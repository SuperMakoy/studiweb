"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"
import { Upload, Loader2, ClipboardCheck, Sparkles, ArrowRight, Clock, FileText, CheckCircle2, TrendingUp } from "lucide-react"

type Difficulty = "easy" | "moderate" | "hard"

export default function EvaluatorDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [recentQuizzes, setRecentQuizzes] = useState<QuizForEvaluation[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, evaluated: 0 })
  
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
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const quizzes = await getQuizzesForEvaluation()
      const pending = quizzes.filter(q => q.evaluationStatus === "pending").length
      const evaluated = quizzes.filter(q => q.evaluationStatus === "evaluated").length
      setStats({ total: quizzes.length, pending, evaluated })
      // Get 3 most recent quizzes
      setRecentQuizzes(quizzes.slice(0, 3))
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

      router.push("/evaluator/quizzes")
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
    })
  }

  const evaluatorName = typeof window !== "undefined" 
    ? sessionStorage.getItem("evaluatorName") || "Evaluator" 
    : "Evaluator"

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
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {/* Welcome Hero Section */}
          <div className="bg-gradient-to-br from-[#5B6EE8] to-[#4A5AC9] rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="text-sm text-white/80">Welcome back</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Hello, {evaluatorName}!
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-xl">
                Ready to evaluate some quizzes? Use the Anderson & Krathwohl taxonomy framework to assess cognitive alignment and improve question quality.
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 md:gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-white/70 text-sm">Awaiting Review</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                  <p className="text-2xl font-bold">{stats.evaluated}</p>
                  <p className="text-white/70 text-sm">Completed</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                  <p className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0}%</p>
                  <p className="text-white/70 text-sm">Progress</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Generate Quiz Section */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Generate New Quiz</h2>
                  <p className="text-gray-500 text-sm">
                    Upload a document to create quiz questions
                  </p>
                </div>
                <div className="w-10 h-10 bg-[#5B6EE8]/10 rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-[#5B6EE8]" />
                </div>
              </div>
              
              <div className="p-5">
                <div className="grid md:grid-cols-2 gap-5">
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
                      className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#5B6EE8] hover:bg-[#5B6EE8]/5 transition-all h-full flex flex-col items-center justify-center"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Upload className="w-5 h-5 text-gray-500" />
                      </div>
                      {uploadedFile ? (
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Click to change</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-700 text-sm">Drop your file here</p>
                          <p className="text-xs text-gray-500 mt-1">TXT, DOC, DOCX (max 1MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    {/* Difficulty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <div className="flex gap-2">
                        {(["easy", "moderate", "hard"] as Difficulty[]).map((d) => (
                          <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`flex-1 py-2 px-3 rounded-lg font-medium capitalize text-sm transition ${
                              difficulty === d
                                ? "bg-[#5B6EE8] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                        Questions: <span className="text-[#5B6EE8] font-semibold">{questionCount}</span>
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
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>10</span>
                        <span>50</span>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerateQuiz}
                      disabled={!uploadedFile || generating}
                      className="w-full bg-[#5B6EE8] hover:bg-[#4A5AC9] text-white py-2.5"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Quiz
                        </>
                      )}
                    </Button>

                    {generateError && (
                      <p className="text-red-500 text-sm">{generateError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push("/evaluator/pending")}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Start Evaluating</p>
                        <p className="text-xs text-gray-500">{stats.pending} pending</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => router.push("/evaluator/evaluated")}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">View Completed</p>
                        <p className="text-xs text-gray-500">{stats.evaluated} done</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              {recentQuizzes.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Recent Quizzes</h3>
                    <button 
                      onClick={() => router.push("/evaluator/quizzes")}
                      className="text-xs text-[#5B6EE8] hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        onClick={() => router.push(
                          quiz.evaluationStatus === "evaluated" 
                            ? `/evaluator/view/${quiz.id}` 
                            : `/evaluator/evaluate/${quiz.id}`
                        )}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          quiz.evaluationStatus === "evaluated" ? "bg-emerald-500" : "bg-amber-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{quiz.fileName}</p>
                          <p className="text-xs text-gray-500">{formatDate(quiz.createdAt)}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          quiz.evaluationStatus === "evaluated" 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {quiz.evaluationStatus === "evaluated" ? "Done" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
