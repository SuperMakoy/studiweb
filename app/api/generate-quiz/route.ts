import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { fileContent, fileName } = await request.json()

    if (!fileContent) {
      return Response.json({ error: "No file content provided" }, { status: 400 })
    }

    const systemPrompt = `You are an expert educational quiz creator. Your ONLY job is to return valid JSON.

RETURN EXACTLY THIS JSON STRUCTURE - no other text:
{
  "fileName": "Study Material",
  "questions": [
    {
      "id": 1,
      "question": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswers": [0],
      "type": "single",
      "cognitiveLevel": "Remember",
      "explanation": "This is the correct answer because [reason in 2-3 sentences]."
    }
  ]
}

ABSOLUTE RULES - FOLLOW EXACTLY:
1. Create 5-10 questions from the study material
2. Every question needs EXACTLY 4 options: options[0], options[1], options[2], options[3]
3. correctAnswers: array with index numbers (e.g., [0] means first option is correct)
4. type: use "single" OR "multiple"
5. cognitiveLevel: MUST be "Remember", "Understand", "Apply", "Analyze", "Evaluate", or "Create"
6. explanation: 2-4 sentences explaining WHY this answer is correct
7. Mix cognitive levels across questions
8. VALID JSON ONLY - no markdown, no code blocks, no extra text
9. No trailing commas
10. All strings in double quotes

Return only the JSON object.`

    const { text } = await generateText({
      model: "groq/mixtral-8x7b-32768",
      system: systemPrompt,
      prompt: `Study Material:\n${fileContent}`,
    })

    // Parse the AI response
    let quizData
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }
      quizData = JSON.parse(jsonMatch[0])
    } catch (parseError: any) {
      console.error("JSON parsing error:", parseError.message)
      throw new Error("Failed to parse AI response as valid JSON")
    }

    // Ensure all questions have required fields including explanation
    if (quizData.questions && Array.isArray(quizData.questions)) {
      quizData.questions = quizData.questions.map((q: any, idx: number) => ({
        id: q.id ?? idx + 1,
        question: q.question ?? "",
        options: q.options ?? [],
        correctAnswers: q.correctAnswers ?? [0],
        type: q.type ?? "single",
        cognitiveLevel: q.cognitiveLevel ?? "Remember",
        explanation: q.explanation ?? "Refer to the study material for the explanation of this answer.",
      }))
    }

    return Response.json(quizData)
  } catch (error: any) {
    console.error("Error generating quiz:", error)
    return Response.json({ error: error.message || "Failed to generate quiz" }, { status: 500 })
  }
}
