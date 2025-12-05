"use client"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswers: number[]
  type: "single" | "multiple"
}

interface QuizQuestionProps {
  question: Question
  selectedAnswers: number[]
  onSelectAnswer: (optionIndex: number) => void
}

export default function QuizQuestion({ question, selectedAnswers, onSelectAnswer }: QuizQuestionProps) {
  return (
    <div className="text-center">
      {/* Question Text */}
      <h2 className="text-4xl font-bold text-white mb-12">{question.question}</h2>

      {/* Options */}
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectAnswer(index)}
            className={`w-full flex items-center gap-4 px-8 py-4 rounded-2xl text-2xl font-bold transition ${
              selectedAnswers.includes(index)
                ? "bg-[#5B6EE8] text-white border-2 border-white"
                : "bg-white text-[#5B6EE8] border-2 border-white hover:bg-gray-100"
            }`}
          >
            {/* Radio/Checkbox */}
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedAnswers.includes(index) ? "bg-white border-white" : "bg-transparent border-gray-400"
              }`}
            >
              {selectedAnswers.includes(index) && <div className="w-3 h-3 bg-[#5B6EE8] rounded-full" />}
            </div>
            <span>{option}</span>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-8 text-white text-lg">
        {question.type === "multiple" ? "Select all correct answers" : "Select the correct answer"}
      </div>
    </div>
  )
}
