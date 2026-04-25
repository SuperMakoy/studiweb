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
      // Clean the response first - remove markdown code blocks if present
      let cleanedText = text.trim()
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/```\s*$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/```\s*$/, "")
      }
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error("Raw text received:", text.substring(0, 200))
        throw new Error("No JSON found in response")
      }
      
      try {
        quizData = JSON.parse(jsonMatch[0])
      } catch (e) {
        // If parsing fails, try removing any trailing/leading whitespace or commas
        const cleanedJson = jsonMatch[0].replace(/,\s*}/, "}").replace(/,\s*]/, "]")
        quizData = JSON.parse(cleanedJson)
      }
    } catch (parseError: any) {
      console.error("JSON parsing error:", parseError.message, "Text:", text.substring(0, 300))
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
