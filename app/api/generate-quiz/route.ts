import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { fileContent, fileName } = await request.json()

    if (!fileContent) {
      return Response.json({ error: "No file content provided" }, { status: 400 })
    }

    const systemPrompt = `You are an expert educational quiz creator. Create a quiz with 5-10 multiple choice questions based on the provided study material.

Return ONLY valid JSON in this format:
{
  "fileName": "filename",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswers": [0],
      "type": "single"
    }
  ]
}

Rules:
- Each question should have 4 options
- correctAnswers array contains the index(es) of correct options (0-3)
- type should be "single" for one correct answer, "multiple" for multiple correct answers
- Create questions that test understanding, not just recall
- Return ONLY valid JSON, no other text`

    const { text } = await generateText({
      model: "groq/mixtral-8x7b-32768",
      system: systemPrompt,
      prompt: `Study Material:\n${fileContent}`,
    })

    // Parse the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON")
    }

    const quizData = JSON.parse(jsonMatch[0])

    return Response.json(quizData)
  } catch (error: any) {
    console.error("Error generating quiz:", error)
    return Response.json({ error: error.message || "Failed to generate quiz" }, { status: 500 })
  }
}
