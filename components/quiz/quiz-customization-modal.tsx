"use client"

import { useState } from "react"

export interface QuizCustomizationConfig {
  length: number
  difficulty: "easy" | "moderate" | "hard"
  timePerQuestion: number
  totalTime: number
}

interface QuizCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (config: QuizCustomizationConfig) => void
  isLoading?: boolean
}

export default function QuizCustomizationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: QuizCustomizationModalProps) {
  const [length, setLength] = useState<number>(10)
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard">("moderate")

  const timePerQuestion = 1.5
  const totalTime = Math.round(length * timePerQuestion)

  const handleConfirm = () => {
    const config: QuizCustomizationConfig = {
      length,
      difficulty,
      timePerQuestion,
      totalTime,
    }
    onConfirm(config)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 pointer-events-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Customize Your Quiz</h2>
            <p className="text-gray-600 text-sm">Configure your quiz experience before we generate it</p>
          </div>

          <div className="space-y-8">
            {/* Quiz Length Selection - Grid of 3 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">Number of Questions</label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setLength(num)}
                    disabled={isLoading}
                    className={`py-3 px-4 rounded-lg font-bold text-lg transition-all ${
                      length === num
                        ? "bg-[#5B6EE8] text-white shadow-lg scale-105"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } disabled:opacity-50`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">Difficulty Level</label>
              <div className="grid grid-cols-1 gap-2">
                {(["easy", "moderate", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    disabled={isLoading}
                    className={`py-3 px-4 rounded-lg font-semibold text-left transition-all capitalize ${
                      difficulty === level
                        ? "bg-[#5B6EE8] text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    {level === "easy" && "🟢 Easy"}
                    {level === "moderate" && "🟡 Moderate"}
                    {level === "hard" && "🔴 Hard"}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Summary */}
            <div className="bg-gradient-to-r from-[#5B6EE8] to-purple-500 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Time to Answer</p>
              <p className="text-3xl font-bold">{totalTime} minutes</p>
              <p className="text-xs opacity-75 mt-2">~{timePerQuestion} min per question</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-[#5B6EE8] hover:bg-[#4a5ad3] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>🎮</span>
                    Start Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
