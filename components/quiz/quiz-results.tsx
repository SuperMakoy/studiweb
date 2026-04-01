"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { saveQuizResult } from "@/lib/file-service"

type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

interface CognitiveLevelStats {
  total: number
  correct: number
}

interface QuizResultsProps {
  score: number
  totalQuestions: number
  fileName: string
  timeElapsed: string
  fileId?: string
  difficulty?: "easy" | "moderate" | "hard"
  points?: number
  cognitiveLevelStats?: Record<CognitiveLevel, CognitiveLevelStats>
}

export default function QuizResults({
  score,
  totalQuestions,
  fileName,
  timeElapsed,
  fileId,
  difficulty = "moderate",
  points = 0,
  cognitiveLevelStats,
}: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const hasSaved = useRef(false)

  useEffect(() => {
    if (fileId && !hasSaved.current) {
      hasSaved.current = true
      saveQuizResult(fileId, fileName, score, totalQuestions, timeElapsed, difficulty, points).catch((err) =>
        console.error("Failed to save quiz result:", err),
      )
    }
  }, [fileId, fileName, score, totalQuestions, timeElapsed, difficulty, points])

  return (
    <div className="w-full max-w-2xl text-center">
      {/* Score Display */}
      <div className="bg-white rounded-full w-48 h-48 flex flex-col items-center justify-center mx-auto mb-8">
        <div className="text-5xl font-bold text-[#5B6EE8]">{score}</div>
        <div className="text-gray-600 text-lg">out of {totalQuestions}</div>
        <div className="text-3xl font-bold text-[#5B6EE8] mt-2">{percentage}%</div>
      </div>

      {/* Results Card */}
      <div className="bg-white text-gray-900 rounded-2xl p-8 mb-8">
        <p className="text-xl font-bold mb-4">File: {fileName}</p>
        <p className="text-xl font-bold">
          Quiz Score: {score}/{totalQuestions}
        </p>
        <p className="text-2xl font-bold text-[#5B6EE8] mt-3">Total Points: {points}</p>
        <p className="text-lg text-gray-600 mt-2">Time: {timeElapsed}</p>
        <p className="text-lg text-gray-600 mt-2 capitalize">Difficulty: {difficulty}</p>
      </div>

      {/* Cognitive Level Breakdown */}
      {cognitiveLevelStats && (
        <div className="bg-white text-gray-900 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-4">Performance by Cognitive Level</h3>
          <div className="space-y-3">
            {(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as CognitiveLevel[]).map((level) => {
              const stats = cognitiveLevelStats[level]
              if (stats.total === 0) return null
              const percent = Math.round((stats.correct / stats.total) * 100)
              return (
                <div key={level} className="flex items-center gap-4">
                  <span className="w-24 text-left font-medium text-gray-700">{level}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-[#5B6EE8] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-sm text-gray-600">
                    {stats.correct}/{stats.total} ({percent}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 justify-center">
        <Link href="/file-library">
          <Button className="bg-white text-[#5B6EE8] px-8 py-3 font-bold rounded-lg hover:bg-gray-100 transition">
            Back to Files
          </Button>
        </Link>

        <Link href="/dashboard">
          <Button className="bg-white text-[#5B6EE8] px-8 py-3 font-bold rounded-lg hover:bg-gray-100 transition">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
