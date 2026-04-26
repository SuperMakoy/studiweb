"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getQuizHistory } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import QuizHistoryCard from "@/components/quiz/quiz-history-card"

export default function QuizHistory() {
  const { user, loading: authLoading } = useAuth()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoadingQuizzes(false)
      return
    }

    const loadQuizHistory = async () => {
      try {
        const history = await getQuizHistory()
        // Get the 4 most recent quizzes
        setQuizzes(history.slice(0, 4))
        setTotalCount(history.length)
      } catch (error) {
        console.error("Error loading quiz history:", error)
        setQuizzes([])
        setTotalCount(0)
      } finally {
        setLoadingQuizzes(false)
      }
    }

    loadQuizHistory()
  }, [user, authLoading])

  if (loadingQuizzes) {
    return <div className="text-gray-500 text-xs md:text-sm">Loading quiz history...</div>
  }

  if (quizzes.length === 0) {
    return <div className="text-gray-500 text-xs md:text-sm">No quizzes taken yet. Start with a file!</div>
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-4">
        {quizzes.map((quiz) => (
          <QuizHistoryCard key={quiz.id} quiz={quiz} showFileName={true} />
        ))}
      </div>
      {totalCount > 4 && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Link href="/quiz-history" style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: "#5B6EE8",
                background: "rgba(91,110,232,0.1)",
                border: "1px solid rgba(91,110,232,0.2)",
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(91,110,232,0.15)"
                e.currentTarget.style.borderColor = "rgba(91,110,232,0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(91,110,232,0.1)"
                e.currentTarget.style.borderColor = "rgba(91,110,232,0.2)"
              }}
            >
              View All {totalCount} Quizzes
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
