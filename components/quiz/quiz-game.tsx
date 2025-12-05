"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import QuizQuestion from "./quiz-question"
import QuizResults from "./quiz-results"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswers: number[]
  type: "single" | "multiple"
}

interface Quiz {
  fileName: string
  questions: Question[]
}

interface QuizGameProps {
  quiz: Quiz
  fileId: string
  totalTimeMinutes?: number
  difficulty?: "easy" | "moderate" | "hard"
}

interface AnswerRecord {
  questionId: number
  isCorrect: boolean
  timeSpent: number
}

export default function QuizGame({ quiz, fileId, totalTimeMinutes = 15, difficulty = "moderate" }: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({})
  const [showResults, setShowResults] = useState(false)
  const totalTimeSeconds = totalTimeMinutes * 60
  const [timeRemaining, setTimeRemaining] = useState(totalTimeSeconds)
  const [finalTimeElapsed, setFinalTimeElapsed] = useState<number | null>(null)

  const [totalPoints, setTotalPoints] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([])
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  useEffect(() => {
    if (showResults) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          const elapsed = totalTimeSeconds - prev
          setFinalTimeElapsed(elapsed)
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showResults, totalTimeSeconds])

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const handleSelectAnswer = (optionIndex: number) => {
    const questionId = currentQuestion.id
    const currentAnswers = selectedAnswers[questionId] || []

    if (currentQuestion.type === "single") {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: [optionIndex],
      })
    } else {
      const newAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter((a) => a !== optionIndex)
        : [...currentAnswers, optionIndex]
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: newAnswers,
      })
    }
  }

  const calculateQuestionPoints = (isCorrect: boolean, timeSpent: number) => {
    if (!isCorrect) {
      const newPoints = Math.floor(totalPoints / 2)
      setTotalPoints(newPoints)
      setCurrentStreak(0)
      return newPoints // Return the new points value
    }

    // Base points for correct answer
    const basePoints = 25

    // Speed multiplier: if answered in 15 seconds or less, get multiplier
    const speedMultiplier = timeSpent <= 15 ? 1.2 : 1.0

    // Update streak
    const newStreak = currentStreak + 1
    setCurrentStreak(newStreak)

    // Calculate total multiplier: speed multiplier × streak
    const totalMultiplier = speedMultiplier * newStreak

    // Calculate final points
    const earnedPoints = Math.round(basePoints * totalMultiplier)

    const newTotalPoints = totalPoints + earnedPoints
    setTotalPoints(newTotalPoints)
    return newTotalPoints
  }

  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const userAnswers = selectedAnswers[currentQuestion.id] || []
    const isCorrect =
      userAnswers.length === currentQuestion.correctAnswers.length &&
      userAnswers.every((a) => currentQuestion.correctAnswers.includes(a))

    // Record the answer
    setAnswerHistory([
      ...answerHistory,
      {
        questionId: currentQuestion.id,
        isCorrect,
        timeSpent,
      },
    ])

    const finalPoints = calculateQuestionPoints(isCorrect, timeSpent)

    if (isLastQuestion) {
      const elapsed = totalTimeSeconds - timeRemaining
      setFinalTimeElapsed(elapsed)
      setTotalPoints(finalPoints)
      setShowResults(true)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleQuit = () => {
    if (confirm("Are you sure you want to quit? Your progress will be lost.")) {
      window.location.href = "/dashboard"
    }
  }

  const calculateScore = () => {
    let correctCount = 0
    quiz.questions.forEach((question) => {
      const userAnswers = selectedAnswers[question.id] || []
      const isCorrect =
        userAnswers.length === question.correctAnswers.length &&
        userAnswers.every((a) => question.correctAnswers.includes(a))

      if (isCorrect) correctCount++
    })
    return correctCount
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const timeElapsed = finalTimeElapsed !== null ? finalTimeElapsed : totalTimeSeconds - timeRemaining

  const isTimeLow = timeRemaining < 60
  const timerColor = isTimeLow ? "text-red-500" : "text-gray-700"

  if (showResults) {
    return (
      <QuizResults
        score={calculateScore()}
        totalQuestions={quiz.questions.length}
        fileName={quiz.fileName}
        timeElapsed={formatTime(timeElapsed)}
        fileId={fileId}
        difficulty={difficulty}
        points={totalPoints}
      />
    )
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Progress Bar and Timer */}
      <div className="bg-gray-300 rounded-full h-6 mb-8 flex items-center justify-between px-4">
        <span className="text-gray-700 font-bold text-sm">
          {currentQuestionIndex + 1}/{quiz.questions.length}
        </span>
        <div className="flex-1 mx-4 bg-gray-400 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
        <span className={`font-bold text-sm ${timerColor}`}>{formatTime(timeRemaining)}</span>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-gray-600 text-sm">Points</span>
            <p className="text-2xl font-bold text-[#5B6EE8]">{totalPoints}</p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Streak</span>
            <p className="text-2xl font-bold text-orange-500">{currentStreak}x</p>
          </div>
        </div>
        {currentStreak > 0 && (
          <div className="text-sm text-gray-600 bg-orange-50 px-3 py-1 rounded-full">
            Answer quickly for 1.2x multiplier!
          </div>
        )}
      </div>

      {/* Question */}
      <QuizQuestion
        question={currentQuestion}
        selectedAnswers={selectedAnswers[currentQuestion.id] || []}
        onSelectAnswer={handleSelectAnswer}
      />

      {/* Controls */}
      <div className="flex items-center justify-between mt-12">
        <Button
          onClick={handleQuit}
          className="bg-gray-400 text-white px-6 py-2 font-bold rounded-lg hover:bg-gray-500 transition"
        >
          Quit
        </Button>

        <div className="flex gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-400 text-white px-6 py-2 font-bold rounded-lg hover:bg-gray-500 transition disabled:opacity-50"
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            className="bg-white text-[#5B6EE8] px-8 py-2 font-bold rounded-lg hover:bg-gray-100 transition"
          >
            {isLastQuestion ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
