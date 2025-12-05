"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  deleteStudyFile,
  getStudyFileById,
  base64ToObjectUrl,
  type StudyFile,
  getQuizHistory,
} from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import DashboardHeader from "@/components/dashboard/header"
import QuizCustomizationModal, { type QuizCustomizationConfig } from "@/components/quiz/quiz-customization-modal"
import QuizHistoryCard from "@/components/quiz/quiz-history-card"
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface FilePreviewClientProps {
  fileId: string
}

export default function FilePreviewClient({ fileId }: FilePreviewClientProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [file, setFile] = useState<StudyFile | null>(null)
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileQuizHistory, setFileQuizHistory] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingFile, setLoadingFile] = useState(true)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      setError("Please log in to view this file")
      setLoadingFile(false)
      return
    }

    const fetchFile = async () => {
      try {
        const fetchedFile = await getStudyFileById(user.uid, fileId)

        if (!fetchedFile) {
          setError("File not found")
          setLoadingFile(false)
          return
        }

        setFile(fetchedFile)

        const objectUrl = base64ToObjectUrl(fetchedFile.fileData, fetchedFile.fileType)
        setFileObjectUrl(objectUrl)
      } catch (err) {
        console.error("Error fetching file:", err)
        setError("Error loading file")
      } finally {
        setLoadingFile(false)
      }
    }

    fetchFile()
  }, [user, loading, fileId])

  useEffect(() => {
    if (loading || !user) return

    const loadFileQuizHistory = async () => {
      try {
        setLoadingStats(true)
        const history = await getQuizHistory()
        const filteredHistory = history.filter((quiz) => quiz.fileId === fileId)
        setFileQuizHistory(filteredHistory)
      } catch (error) {
        console.error("Error loading quiz history:", error)
        setFileQuizHistory([])
      } finally {
        setLoadingStats(false)
      }
    }

    loadFileQuizHistory()
  }, [user, loading, fileId])

  const handleDelete = async () => {
    if (!user || !confirm("Are you sure you want to delete this file?")) return

    setDeleting(true)
    try {
      await deleteStudyFile(fileId)
      router.push("/file-library")
    } catch (error) {
      console.error("Error deleting file:", error)
      setDeleting(false)
    }
  }

  const handleStartQuiz = async () => {
    setShowCustomizationModal(true)
  }

  const handleQuizCustomizationConfirm = async (config: QuizCustomizationConfig) => {
    setGeneratingQuiz(true)
    try {
      router.push(`/quiz/${fileId}?length=${config.length}&difficulty=${config.difficulty}`)
    } catch (error) {
      console.error("Error navigating to quiz:", error)
      setGeneratingQuiz(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const difficultyData = [
    { name: "Easy", value: fileQuizHistory.filter((q) => q.difficulty === "easy").length, color: "#51CF66" },
    { name: "Moderate", value: fileQuizHistory.filter((q) => q.difficulty === "moderate").length, color: "#FFD43B" },
    { name: "Hard", value: fileQuizHistory.filter((q) => q.difficulty === "hard").length, color: "#FF6B6B" },
  ].filter((d) => d.value > 0)

  const averageScoresByDifficulty = [
    {
      difficulty: "Easy",
      avgScore:
        fileQuizHistory.filter((q) => q.difficulty === "easy").length > 0
          ? Math.round(
              (fileQuizHistory
                .filter((q) => q.difficulty === "easy")
                .reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) /
                fileQuizHistory.filter((q) => q.difficulty === "easy").length) *
                10,
            ) / 10
          : 0,
      color: "#51CF66",
      count: fileQuizHistory.filter((q) => q.difficulty === "easy").length,
    },
    {
      difficulty: "Moderate",
      avgScore:
        fileQuizHistory.filter((q) => q.difficulty === "moderate").length > 0
          ? Math.round(
              (fileQuizHistory
                .filter((q) => q.difficulty === "moderate")
                .reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) /
                fileQuizHistory.filter((q) => q.difficulty === "moderate").length) *
                10,
            ) / 10
          : 0,
      color: "#FFD43B",
      count: fileQuizHistory.filter((q) => q.difficulty === "moderate").length,
    },
    {
      difficulty: "Hard",
      avgScore:
        fileQuizHistory.filter((q) => q.difficulty === "hard").length > 0
          ? Math.round(
              (fileQuizHistory
                .filter((q) => q.difficulty === "hard")
                .reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) /
                fileQuizHistory.filter((q) => q.difficulty === "hard").length) *
                10,
            ) / 10
          : 0,
      color: "#FF6B6B",
      count: fileQuizHistory.filter((q) => q.difficulty === "hard").length,
    },
  ].filter((d) => d.count > 0)

  const scoreData = fileQuizHistory
    .slice()
    .reverse()
    .map((quiz, index) => ({
      attempt: `#${index + 1}`,
      score: quiz.score,
      total: quiz.totalQuestions,
      percentage: Math.round((quiz.score / quiz.totalQuestions) * 100),
      points: quiz.points || 0,
    }))

  if (loading || loadingFile) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>
  if (!file) return <div className="flex items-center justify-center h-screen">File not found</div>

  return (
    <div className="md:flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <DashboardHeader showSearch={false} />
        <div className="p-4 md:p-8">
          <div className="mb-6 md:mb-8">
            <Link
              href="/file-library"
              className="text-[#5B6EE8] hover:underline mb-4 inline-block text-sm md:text-base"
            >
              ← Back to File Library
            </Link>

            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-2xl flex items-center justify-center text-5xl md:text-7xl flex-shrink-0">
                📁
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {file.displayName || file.fileName}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mb-1">
                  <strong>File Size:</strong> {formatFileSize(file.fileSize)}
                </p>
                <p className="text-sm md:text-base text-gray-600 mb-1">
                  <strong>Uploaded:</strong> {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
                <p className="text-sm md:text-base text-gray-600">
                  <strong>File Type:</strong> {file.fileType || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {fileObjectUrl && (
            <div className="mb-8 md:mb-12 bg-gray-50 rounded-xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">File Preview</h2>
              {file.fileType === "application/pdf" ? (
                <iframe
                  src={fileObjectUrl}
                  className="w-full h-64 sm:h-80 md:h-96 rounded-lg border border-gray-300"
                  title="PDF Preview"
                />
              ) : file.fileType === "text/plain" ? (
                <div className="bg-white p-4 rounded-lg border border-gray-300 overflow-auto max-h-64 md:max-h-96 text-xs md:text-sm whitespace-pre-wrap break-words font-mono">
                  <TextFileViewer fileObjectUrl={fileObjectUrl} />
                </div>
              ) : file.fileType?.includes("wordprocessingml") || file.fileType === "application/msword" ? (
                <div className="bg-white p-4 rounded-lg border border-gray-300 text-gray-600 text-sm md:text-base">
                  <p>Word document preview not available. Click "Start Quiz" to generate a quiz from this file.</p>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-gray-300 text-gray-600 text-sm md:text-base">
                  <p>Preview not available for this file type.</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            <button
              onClick={handleStartQuiz}
              disabled={generatingQuiz}
              className="w-full bg-[#5B6EE8] hover:bg-[#4a5ad3] disabled:bg-[#3a4ab3] text-white font-bold py-4 md:py-6 px-6 md:px-8 rounded-xl transition transform hover:scale-105"
            >
              <div className="text-xl md:text-2xl mb-2">{generatingQuiz ? "⏳" : "🎮"}</div>
              <span className="text-sm md:text-base">{generatingQuiz ? "Preparing..." : "Start Quiz"}</span>
            </button>

            <button
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 md:py-6 px-6 md:px-8 rounded-xl transition transform hover:scale-105"
              disabled
            >
              <div className="text-xl md:text-2xl mb-2">🤖</div>
              <span className="text-sm md:text-base">Study with Ai</span>
              <p className="text-xs mt-1 opacity-75">(Coming Soon)</p>
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-4 md:py-6 px-6 md:px-8 rounded-xl transition transform hover:scale-105"
            >
              <div className="text-xl md:text-2xl mb-2">🗑️</div>
              <span className="text-sm md:text-base">{deleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Previous Quiz Stats</h2>
            {loadingStats ? (
              <div className="bg-gray-100 rounded-xl p-6 md:p-8 text-center">
                <p className="text-gray-600 text-sm md:text-base">Loading quiz history...</p>
              </div>
            ) : fileQuizHistory.length === 0 ? (
              <div className="bg-gray-100 rounded-xl p-6 md:p-8 text-center">
                <p className="text-gray-600 text-sm md:text-base">
                  No quiz attempts yet for this file. Start a quiz to see your stats here!
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Recent Attempts (Last 6)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fileQuizHistory.slice(0, 6).map((quiz) => (
                      <QuizHistoryCard key={quiz.id} quiz={quiz} showFileName={false} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">Difficulty Distribution</CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        Quiz attempts by difficulty level
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          easy: { label: "Easy", color: "#51CF66" },
                          moderate: { label: "Moderate", color: "#FFD43B" },
                          hard: { label: "Hard", color: "#FF6B6B" },
                        }}
                        className="h-[200px] sm:h-[250px] md:h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={difficultyData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {difficultyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">Average Scores by Difficulty</CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        Your average performance for each difficulty level
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          avgScore: { label: "Avg Score %", color: "#5B6EE8" },
                        }}
                        className="h-[200px] sm:h-[250px] md:h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={averageScoresByDifficulty}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="difficulty" />
                            <YAxis domain={[0, 100]} />
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                      <p className="font-semibold">{data.difficulty}</p>
                                      <p className="text-sm font-bold" style={{ color: data.color }}>
                                        Average: {data.avgScore}%
                                      </p>
                                      <p className="text-sm text-gray-600">Attempts: {data.count}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Legend />
                            <Bar dataKey="avgScore" name="Avg Score %" radius={[8, 8, 0, 0]}>
                              {averageScoresByDifficulty.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>

        <QuizCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          onConfirm={handleQuizCustomizationConfirm}
          isLoading={generatingQuiz}
        />
      </main>
    </div>
  )
}

const TextFileViewer = ({ fileObjectUrl }: { fileObjectUrl: string }) => {
  const [content, setContent] = useState<string>("")

  useEffect(() => {
    const loadTextContent = async () => {
      try {
        const response = await fetch(fileObjectUrl)
        const text = await response.text()
        setContent(text)
      } catch (error) {
        console.error("Error loading text file:", error)
        setContent("Error loading file content")
      }
    }

    loadTextContent()
  }, [fileObjectUrl])

  return <>{content}</>
}
