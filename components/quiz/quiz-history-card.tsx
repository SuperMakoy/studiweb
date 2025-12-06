"use client"

import { useState } from "react"

interface QuizHistoryCardProps {
  quiz: {
    id: string
    fileName?: string
    displayName?: string
    score: number
    totalQuestions: number
    points: number
    timeElapsed: string
    difficulty: string
    completedAt?: Date
  }
  showFileName?: boolean
}

export default function QuizHistoryCard({ quiz, showFileName = true }: QuizHistoryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatDifficulty = (difficulty: string) => {
    const difficultyIcons = {
      easy: "🟢",
      moderate: "🟡",
      hard: "🔴",
    }
    return `${difficultyIcons[difficulty as keyof typeof difficultyIcons] || "🟡"} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
  }

  const percentage = Math.round((quiz.score / quiz.totalQuestions) * 100)

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-[#5B6EE8] text-white rounded-lg md:rounded-2xl p-2 md:p-5 hover:shadow-xl transition transform hover:scale-105 cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2 md:mb-4">
          <h3 className="text-xs md:text-lg font-bold">Quiz Details</h3>
        </div>

        {showFileName && (
          <div className="mb-2 md:mb-4">
            <p className="text-[8px] md:text-[10px] opacity-70 uppercase tracking-wide mb-0.5">File Name</p>
            <p className="text-[10px] md:text-xs font-semibold truncate">{quiz.displayName || quiz.fileName}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-4">
          <div>
            <p className="text-[8px] md:text-[10px] opacity-70 uppercase tracking-wide mb-0.5">Score</p>
            <p className="text-base md:text-2xl font-bold">
              {quiz.score}/{quiz.totalQuestions}
            </p>
            <p className="text-xs md:text-lg opacity-90 mt-0.5">{percentage}%</p>
          </div>

          <div>
            <p className="text-[8px] md:text-[10px] opacity-70 uppercase tracking-wide mb-0.5">Points Earned</p>
            <p className="text-base md:text-2xl font-bold">{quiz.points || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div>
            <p className="text-[8px] md:text-[10px] opacity-70 uppercase tracking-wide mb-0.5">Time Taken</p>
            <p className="text-[10px] md:text-base font-semibold">{quiz.timeElapsed}</p>
          </div>

          <div>
            <p className="text-[8px] md:text-[10px] opacity-70 uppercase tracking-wide mb-0.5">Difficulty</p>
            <p className="text-[10px] md:text-base font-semibold">{formatDifficulty(quiz.difficulty || "moderate")}</p>
          </div>
        </div>

        {quiz.completedAt && (
          <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white border-opacity-20">
            <p className="text-[8px] md:text-[10px] opacity-70 uppercase tracking-wide mb-0.5">Completed On</p>
            <p className="text-[9px] md:text-xs">
              {new Date(quiz.completedAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#5B6EE8] text-white rounded-3xl p-12 max-w-2xl w-full shadow-2xl transform scale-100 transition"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold">Quiz Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-gray-200 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {showFileName && (
              <div className="mb-6">
                <p className="text-sm opacity-70 uppercase tracking-wide mb-1">File Name</p>
                <p className="text-xl font-semibold">{quiz.displayName || quiz.fileName}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <p className="text-sm opacity-70 uppercase tracking-wide mb-1">Score</p>
                <p className="text-5xl font-bold">
                  {quiz.score}/{quiz.totalQuestions}
                </p>
                <p className="text-3xl opacity-90 mt-2">{percentage}%</p>
              </div>

              <div>
                <p className="text-sm opacity-70 uppercase tracking-wide mb-1">Points Earned</p>
                <p className="text-5xl font-bold">{quiz.points || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm opacity-70 uppercase tracking-wide mb-1">Time Taken</p>
                <p className="text-2xl font-semibold">{quiz.timeElapsed}</p>
              </div>

              <div>
                <p className="text-sm opacity-70 uppercase tracking-wide mb-1">Difficulty</p>
                <p className="text-2xl font-semibold">{formatDifficulty(quiz.difficulty || "moderate")}</p>
              </div>
            </div>

            {quiz.completedAt && (
              <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                <p className="text-sm opacity-70 uppercase tracking-wide mb-1">Completed On</p>
                <p className="text-xl">
                  {new Date(quiz.completedAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
