"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getQuizHistory } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
import QuizHistoryCard from "@/components/quiz/quiz-history-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 12

export default function QuizHistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [allQuizzes, setAllQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    const loadAllHistory = async () => {
      try {
        const history = await getQuizHistory()
        setAllQuizzes(history)
      } catch (error) {
        console.error("Error loading quiz history:", error)
        setAllQuizzes([])
      } finally {
        setLoading(false)
      }
    }

    loadAllHistory()
  }, [user, authLoading])

  const totalPages = Math.ceil(allQuizzes.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedQuizzes = allQuizzes.slice(startIdx, endIdx)

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .qh-wrap { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .qh-btn { transition: all .2s; cursor: pointer; font-family: inherit; }
        .qh-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .qh-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @keyframes qhFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .qh-fadein { animation: qhFadeIn .3s ease forwards; }
      `}</style>

      <div
        className="qh-wrap"
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#07071a",
          color: "#fff",
        }}
      >
        <MobileHeaderNav />
        <Sidebar />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
          className="pt-14 md:pt-0"
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(7,7,26,0.85)",
              backdropFilter: "blur(12px)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                }}
              >
                Quiz History
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
                All your quiz attempts
              </p>
            </div>

            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button
                className="qh-btn"
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Back to Dashboard
              </button>
            </Link>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "24px 28px",
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                Loading quiz history...
              </div>
            ) : allQuizzes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.4)",
                  paddingTop: 40,
                }}
              >
                <p style={{ fontSize: 14, marginBottom: 20 }}>No quizzes taken yet</p>
                <Link href="/dashboard" style={{ textDecoration: "none" }}>
                  <button
                    className="qh-btn"
                    style={{
                      padding: "10px 20px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                      background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Take a Quiz
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {/* Quizzes Grid */}
                <div
                  className="qh-fadein"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: 16,
                    marginBottom: 32,
                  }}
                >
                  {paginatedQuizzes.map((quiz) => (
                    <QuizHistoryCard key={quiz.id} quiz={quiz} showFileName={true} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      paddingTop: 20,
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <button
                      className="qh-btn"
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.7)",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.5 : 1,
                      }}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className="qh-btn"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: page === currentPage ? "#fff" : "rgba(255,255,255,0.6)",
                            background:
                              page === currentPage
                                ? "linear-gradient(135deg,#5B6EE8,#7b5ea7)"
                                : "rgba(255,255,255,0.05)",
                            border:
                              page === currentPage
                                ? "1px solid rgba(91,110,232,0.3)"
                                : "1px solid rgba(255,255,255,0.1)",
                            cursor: "pointer",
                          }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      className="qh-btn"
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.7)",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        opacity: currentPage === totalPages ? 0.5 : 1,
                      }}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Stats */}
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 20,
                  }}
                >
                  Showing {startIdx + 1} to {Math.min(endIdx, allQuizzes.length)} of {allQuizzes.length} quizzes
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
