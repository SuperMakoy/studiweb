import { auth } from "@/lib/firebase"

export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswers: number[]
  type: "single" | "multiple"
}

export interface Quiz {
  fileName: string
  questions: Question[]
}

export interface QuizOptions {
  length?: number
  difficulty?: "easy" | "moderate" | "hard"
}

export async function generateQuizFromFile(fileId: string, userId: string, options?: QuizOptions): Promise<Quiz> {
  try {
    console.log("[v0] Calling quiz generation API for file:", fileId, "with options:", options)
    const user = auth.currentUser
    if (!user || user.uid !== userId) throw new Error("Please sign in to STUDI")
    const token = await user.getIdToken()
    const response = await fetch("/api/generate-quiz-from-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileId,
        userId,
        length: options?.length || 10,
        difficulty: options?.difficulty || "moderate",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to generate quiz")
    }

    const quizData = await response.json()
    console.log("[v0] Quiz generated successfully:", quizData.questions.length, "questions")
    return quizData
  } catch (error: any) {
    console.error("[v0] Error in generateQuizFromFile:", error)
    throw error
  }
}
