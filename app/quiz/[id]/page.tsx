"use client"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import QuizGame from "@/components/quiz/quiz-game"
import type { Quiz, QuizOptions } from "@/lib/quiz-service"
import { generateQuizFromFile } from "@/lib/quiz-service"

export default function QuizPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const fileId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const quizOptions: QuizOptions = {
    length: (() => {
      const lengthParam = searchParams.get("length")
      const parsed = lengthParam ? Number.parseInt(lengthParam) : null
      return parsed && [5, 10, 20].includes(parsed) ? parsed : 10
    })() as 5 | 10 | 20,
    difficulty: (searchParams.get("difficulty") as "easy" | "moderate" | "hard") || "moderate",
  }

  const totalTimeMinutes = Math.round(quizOptions.length! * 1.5)

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) {
        setError("Please log in to access quizzes")
        setLoading(false)
      }
      return
    }

    const loadQuiz = async () => {
      try {
        console.log("[v0] Loading quiz for file:", fileId, "with options:", quizOptions)
        setLoading(true)
        setError(null)

        const generatedQuiz = await generateQuizFromFile(fileId, user.uid, quizOptions)
        setQuiz(generatedQuiz)
      } catch (err: any) {
        console.error("[v0] Error loading quiz:", err)
        setError(err.message || "Failed to generate quiz. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [fileId, user, authLoading])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#5B6EE8] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Generating your quiz...</p>
          <p className="text-sm opacity-75 mt-2">
            This may take a few moments while we extract and analyze your study material
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#5B6EE8] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <a href="/file-library" className="text-[#5B6EE8] hover:underline font-semibold">
            Back to File Library
          </a>
        </div>
      </div>
    )
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#5B6EE8] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Questions Generated</h2>
          <p className="text-gray-700 mb-6">
            Could not generate quiz questions from this file. Please try another file.
          </p>
          <a href="/file-library" className="text-[#5B6EE8] hover:underline font-semibold">
            Back to File Library
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#5B6EE8] flex items-center justify-center p-4">
      <QuizGame quiz={quiz} fileId={fileId} totalTimeMinutes={totalTimeMinutes} difficulty={quizOptions.difficulty} />
    </div>
  )
}
