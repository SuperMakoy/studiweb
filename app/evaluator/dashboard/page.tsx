"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"
import { FileText, Clock, ChevronRight, LogOut, Upload, Loader2 } from "lucide-react"

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
    // Check if evaluator is logged in
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
      // Read file content
      const content = await uploadedFile.text()

      // Call the API to generate quiz
      const response = await fetch("/api/generate-quiz-from-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: `eval-${Date.now()}`,
          userId: "evaluator",
          fileName: uploadedFile.name,
          difficulty,
          length: questionCount,
          content, // Pass content directly for evaluator
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate quiz")
      }

      // Reload quizzes to show the new one
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

  const handleLogout = () => {
    sessionStorage.removeItem("isEvaluator")
    sessionStorage.removeItem("evaluatorName")
    router.push("/evaluator/login")
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
        return "bg-green-100 text-green-700"
      case "moderate":
        return "bg-yellow-100 text-yellow-700"
      case "hard":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "evaluated":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Evaluated</span>
      case "pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#5B6EE8] flex items-center justify-center">
        <div className="text-white text-xl">Loading quizzes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#5B6EE8] text-white py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Evaluator Dashboard</h1>
            <p className="text-white/80 mt-1">
              Welcome, {sessionStorage.getItem("evaluatorName") || "Evaluator"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-transparent border-white text-white hover:bg-white hover:text-[#5B6EE8]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-8">
        {/* Generate Quiz Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generate Quiz for Evaluation</h2>
          <p className="text-gray-600 mb-6">
            Upload a file to generate a quiz and evaluate its taxonomy alignment.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: File Upload */}
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
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#5B6EE8] hover:bg-gray-50 transition"
              >
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                {uploadedFile ? (
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-gray-700">Click to upload a file</p>
                    <p className="text-sm text-gray-500 mt-1">TXT, DOC, DOCX (max 1MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Settings */}
            <div className="space-y-4">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {(["easy", "moderate", "hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium capitalize transition ${
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
                  Number of Questions: {questionCount}
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
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateQuiz}
                disabled={!uploadedFile || generating}
                className="w-full bg-[#5B6EE8] hover:bg-[#4a5cd6] text-white py-3"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>

              {generateError && (
                <p className="text-red-600 text-sm">{generateError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quizzes List Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quizzes for Evaluation</h2>
          <p className="text-gray-600 mt-1">
            Evaluate each quiz to check if questions align with Anderson & Krathwohl taxonomy
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No quizzes to evaluate</h3>
            <p className="text-gray-500 mt-2">
              Quizzes will appear here once students generate them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{quiz.fileName}</h3>
                      {getStatusBadge(quiz.evaluationStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {quiz.questionCount} questions
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(quiz.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`/evaluator/evaluate/${quiz.id}`)}
                    className="bg-[#5B6EE8] hover:bg-[#4a5cd6] text-white"
                  >
                    {quiz.evaluationStatus === "evaluated" ? "View Evaluation" : "Evaluate"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
