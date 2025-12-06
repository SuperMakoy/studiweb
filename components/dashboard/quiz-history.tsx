"use client"

import { useState, useEffect } from "react"
import { getQuizHistory } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import QuizHistoryCard from "@/components/quiz/quiz-history-card"

export default function QuizHistory() {
  const { user, loading: authLoading } = useAuth()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)

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
      } catch (error) {
        console.error("Error loading quiz history:", error)
        setQuizzes([])
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-4">
      {quizzes.map((quiz) => (
        <QuizHistoryCard key={quiz.id} quiz={quiz} showFileName={true} />
      ))}
    </div>
  )
}
