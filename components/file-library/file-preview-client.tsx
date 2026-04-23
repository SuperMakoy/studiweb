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
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
import QuizCustomizationModal, {
  type QuizCustomizationConfig,
} from "@/components/quiz/quiz-customization-modal"
import QuizHistoryCard from "@/components/quiz/quiz-history-card"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"

// ── types & helpers ────────────────────────────────────────────────────────
interface FilePreviewClientProps {
  fileId: string
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

// ── styles ─────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
  .fpc-wrap * { box-sizing: border-box; }
  .fpc-wrap { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
  .fpc-action-btn { transition: all .2s; cursor: pointer; font-family: inherit; }
  .fpc-action-btn:hover:not(:disabled) { transform: translateY(-2px); }
  .fpc-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  @keyframes fpcBlob {
    0%,100% { transform: scale(1); }
    50% { transform: scale(1.07); }
  }
  .fpc-blob { animation: fpcBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
  .fpc-stat-card:hover { border-color: rgba(91,110,232,0.3) !important; transform: translateY(-1px); }
`

// ── main component ─────────────────────────────────────────────────────────
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

  // ── data fetching — logic unchanged ────────────────────────────────────
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
        if (!fetchedFile) { setError("File not found"); setLoadingFile(false); return }
        setFile(fetchedFile)
        setFileObjectUrl(base64ToObjectUrl(fetchedFile.fileData, fetchedFile.fileType))
      } catch (err) {
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
        setFileQuizHistory(history.filter((quiz) => quiz.fileId === fileId))
      } catch (error) {
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
      setDeleting(false)
    }
  }

  const handleStartQuiz = () => setShowCustomizationModal(true)

  const handleQuizCustomizationConfirm = async (config: QuizCustomizationConfig) => {
    setGeneratingQuiz(true)
    try {
      router.push(`/quiz/${fileId}?length=${config.length}&difficulty=${config.difficulty}`)
    } catch (error) {
      setGeneratingQuiz(false)
    }
  }
  // ───────────────────────────────────────────────────────────────────────

  // ── chart data — logic unchanged ───────────────────────────────────────
  const difficultyData = [
    { name: "Easy",     value: fileQuizHistory.filter((q) => q.difficulty === "easy").length,     color: "#51CF66" },
    { name: "Moderate", value: fileQuizHistory.filter((q) => q.difficulty === "moderate").length, color: "#FFD43B" },
    { name: "Hard",     value: fileQuizHistory.filter((q) => q.difficulty === "hard").length,     color: "#FF6B6B" },
  ].filter((d) => d.value > 0)

  const averageScoresByDifficulty = ["easy", "moderate", "hard"].map((diff) => {
    const filtered = fileQuizHistory.filter((q) => q.difficulty === diff)
    return {
      difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
      avgScore: filtered.length > 0
        ? Math.round((filtered.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / filtered.length) * 10) / 10
        : 0,
      color: diff === "easy" ? "#51CF66" : diff === "moderate" ? "#FFD43B" : "#FF6B6B",
      count: filtered.length,
    }
  }).filter((d) => d.count > 0)
  // ───────────────────────────────────────────────────────────────────────

  if (loading || loadingFile) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#07071a", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
        Loading…
      </div>
    )
  }
  if (error) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#07071a", alignItems: "center", justifyContent: "center", color: "#FF6B6B", fontSize: 14 }}>
        {error}
      </div>
    )
  }
  if (!file) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#07071a", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
        File not found
      </div>
    )
  }

  return (
    <>
      <style>{STYLES}</style>

      <div
        className="fpc-wrap"
        style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}
      >
        {/* Ambient blobs */}
        <div className="fpc-blob" style={{ width: 320, height: 320, background: "rgba(91,110,232,0.09)", top: -60, left: 220, animationDuration: "9s" }} />
        <div className="fpc-blob" style={{ width: 240, height: 240, background: "rgba(123,94,167,0.06)", bottom: 60, right: 60, animationDuration: "13s", animationDelay: "4s" }} />

        <MobileHeaderNav />
        <Sidebar />

        <main
          style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}
          className="pt-14 md:pt-0"
        >
          {/* ── Top bar ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(7,7,26,0.85)",
              backdropFilter: "blur(12px)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <Link
              href="/file-library"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                transition: "color .2s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              File Library
            </Link>

            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#51CF66,#37b24d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                color: "#fff",
              }}
            >
              M
            </div>
          </div>

          <div style={{ padding: "28px" }}>

            {/* ── File hero ── */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "24px 28px",
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                marginBottom: 24,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  background: "linear-gradient(135deg,#FFD43B,#FFA94D)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  flexShrink: 0,
                }}
              >
                📁
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "clamp(18px, 3vw, 26px)",
                    fontWeight: 800,
                    color: "#fff",
                    margin: "0 0 8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.displayName || file.fileName}
                </h1>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Size",     value: formatFileSize(file.fileSize) },
                    { label: "Uploaded", value: new Date(file.uploadedAt).toLocaleDateString() },
                    { label: "Type",     value: file.fileType || "Unknown" },
                  ].map((m) => (
                    <div key={m.label} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      <span style={{ color: "rgba(255,255,255,0.2)" }}>{m.label}: </span>
                      {m.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
                marginBottom: 28,
              }}
            >
              {/* Start Quiz */}
              <button
                className="fpc-action-btn"
                onClick={handleStartQuiz}
                disabled={generatingQuiz}
                style={{
                  padding: "18px 16px",
                  borderRadius: 16,
                  border: "1px solid rgba(91,110,232,0.3)",
                  background: "rgba(91,110,232,0.12)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 28 }}>{generatingQuiz ? "⏳" : "🎮"}</span>
                {generatingQuiz ? "Preparing…" : "Start Quiz"}
              </button>

              {/* Study with AI */}
              <button
                className="fpc-action-btn"
                disabled
                style={{
                  padding: "18px 16px",
                  borderRadius: 16,
                  border: "1px solid rgba(155,94,167,0.2)",
                  background: "rgba(123,94,167,0.08)",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 28 }}>🤖</span>
                <span>Study with AI</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#FFD43B",
                    background: "rgba(255,212,59,0.1)",
                    border: "1px solid rgba(255,212,59,0.2)",
                    borderRadius: 100,
                    padding: "2px 8px",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                  }}
                >
                  Soon
                </span>
              </button>

              {/* Delete */}
              <button
                className="fpc-action-btn"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "18px 16px",
                  borderRadius: 16,
                  border: "1px solid rgba(255,107,107,0.2)",
                  background: "rgba(255,107,107,0.08)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 28 }}>🗑️</span>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>

            {/* ── File preview ── */}
            {fileObjectUrl && (
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "20px 22px",
                  marginBottom: 28,
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.6)",
                    margin: "0 0 14px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  File Preview
                </h2>

                {file.fileType === "application/pdf" ? (
                  <iframe
                    src={fileObjectUrl}
                    style={{ width: "100%", height: 360, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}
                    title="PDF Preview"
                  />
                ) : file.fileType === "text/plain" ? (
                  <div
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.07)",
                      padding: 16,
                      overflowY: "auto",
                      maxHeight: 300,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: "monospace",
                      lineHeight: 1.7,
                    }}
                  >
                    <TextFileViewer fileObjectUrl={fileObjectUrl} />
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                    Preview not available for this file type. Start a quiz to use this file.
                  </p>
                )}
              </div>
            )}

            {/* ── Previous quiz stats ── */}
            <div>
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 16px",
                }}
              >
                Previous Quiz Stats
              </h2>

              {loadingStats ? (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", padding: "24px 0" }}>
                  Loading quiz history…
                </div>
              ) : fileQuizHistory.length === 0 ? (
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                    No quiz attempts yet. Start a quiz to see your stats here!
                  </p>
                </div>
              ) : (
                <>
                  {/* Recent attempts */}
                  <div style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.3)",
                        textTransform: "uppercase",
                        letterSpacing: "1.2px",
                        marginBottom: 12,
                      }}
                    >
                      Recent Attempts
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: 12,
                      }}
                    >
                      {fileQuizHistory.slice(0, 6).map((quiz) => (
                        <QuizHistoryCard key={quiz.id} quiz={quiz} showFileName={false} />
                      ))}
                    </div>
                  </div>

                  {/* Charts */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {/* Difficulty pie */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 16,
                        padding: "20px",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                        Difficulty Distribution
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={difficultyData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            dataKey="value"
                          >
                            {difficultyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend
                            formatter={(value) => (
                              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Avg scores bar */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 16,
                        padding: "20px",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                        Avg Score by Difficulty
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={averageScoresByDifficulty}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="difficulty" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Bar dataKey="avgScore" name="Avg %" radius={[8, 8, 0, 0]}>
                            {averageScoresByDifficulty.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      <QuizCustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        onConfirm={handleQuizCustomizationConfirm}
        isLoading={generatingQuiz}
      />
    </>
  )
}

// ── Text file viewer — logic unchanged ────────────────────────────────────
const TextFileViewer = ({ fileObjectUrl }: { fileObjectUrl: string }) => {
  const [content, setContent] = useState<string>("")
  useEffect(() => {
    const loadTextContent = async () => {
      try {
        const response = await fetch(fileObjectUrl)
        const text = await response.text()
        setContent(text)
      } catch (error) {
        setContent("Error loading file content")
      }
    }
    loadTextContent()
  }, [fileObjectUrl])
  return <>{content}</>
}