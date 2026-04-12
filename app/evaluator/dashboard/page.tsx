"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import { FileText, Clock, ChevronRight, Upload, Loader2, ClipboardCheck, AlertCircle, CheckCircle2 } from "lucide-react"

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

  // Stats
  const pendingCount = quizzes.filter((q) => q.evaluationStatus === "pending").length
  const evaluatedCount = quizzes.filter((q) => q.evaluationStatus === "evaluated").length

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <EvaluatorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <EvaluatorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Evaluator Dashboard</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Anderson & Krathwohl Taxonomy Evaluation
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{quizzes.length}</p>
                  <p className="text-slate-500 text-sm">Total Quizzes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
                  <p className="text-slate-500 text-sm">Pending Review</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{evaluatedCount}</p>
                  <p className="text-slate-500 text-sm">Evaluated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Quiz Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Generate Quiz for Evaluation</h2>
              <p className="text-slate-500 text-sm">
                Upload a document to generate a quiz and evaluate its taxonomy alignment
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
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
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all"
                  >
                    <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                    {uploadedFile ? (
                      <div>
                        <p className="font-medium text-slate-800">{uploadedFile.name}</p>
                        <p className="text-sm text-slate-500 mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-slate-700">Click to upload a file</p>
                        <p className="text-sm text-slate-500 mt-1">TXT, DOC, DOCX (max 1MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-5">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty Level</label>
                    <div className="flex gap-2">
                      {(["easy", "moderate", "hard"] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`flex-1 py-2.5 px-4 rounded-lg font-medium capitalize text-sm transition ${
                            difficulty === d
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Number of Questions: <span className="text-blue-600 font-semibold">{questionCount}</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>10</span>
                      <span>50</span>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={!uploadedFile || generating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
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
                    <p className="text-rose-600 text-sm">{generateError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Quizzes for Evaluation</h2>
              <p className="text-slate-500 text-sm">
                Review and evaluate quizzes for taxonomy alignment
              </p>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                {error}
              </div>
            )}

            {quizzes.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-800">No quizzes to evaluate</h3>
                <p className="text-slate-500 mt-2">
                  Generate a quiz above to start evaluating
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-semibold text-slate-800 truncate">{quiz.fileName}</h3>
                          {quiz.evaluationStatus === "evaluated" ? (
                            <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                              Evaluated
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4" />
                            {quiz.questionCount} questions
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
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
                        className={
                          quiz.evaluationStatus === "evaluated" 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }
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
