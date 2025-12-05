// API route to generate quiz from uploaded file
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { extractFileContent } from "@/lib/file-extraction-service"

export async function POST(request: NextRequest) {
  try {
    const { fileId, userId, length = 10, difficulty = "moderate" } = await request.json()

    if (!fileId || !userId) {
      return NextResponse.json({ error: "Missing fileId or userId" }, { status: 400 })
    }

    const fileDoc = doc(db, "users", userId, "files", fileId)
    const fileSnapshot = await getDoc(fileDoc)

    if (!fileSnapshot.exists()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileData = fileSnapshot.data()
    const { fileData: base64Data, fileType, fileName } = fileData

    // Extract content from file
    console.log("[v0] Extracting content from", fileName)
    const extractedContent = await extractFileContent(base64Data, fileType, fileName)

    if (!extractedContent || extractedContent.length === 0) {
      return NextResponse.json({ error: "No content extracted from file" }, { status: 400 })
    }

    console.log("[v0] Generating quiz from extracted content using Groq API")
    const systemPrompt = `You are an expert educational quiz creator. Create a quiz with ${length} multiple choice questions at ${difficulty} difficulty level based on the provided study material.

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
- Generate exactly ${length} questions
- Difficulty level: ${difficulty} (easy: basic recall, moderate: comprehension and application, hard: analysis and synthesis)
- Each question should have 4 options
- correctAnswers array contains the index(es) of correct options (0-3)
- type should be "single" for one correct answer, "multiple" for multiple correct answers
- Create questions that test understanding, not just recall
- Return ONLY valid JSON, no other text`

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Study Material from "${fileName}":\n\n${extractedContent}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!groqResponse.ok) {
      const error = await groqResponse.json()
      throw new Error(`Groq API error: ${error.error?.message || "Unknown error"}`)
    }

    const groqData = await groqResponse.json()
    const text = groqData.choices[0].message.content

    // Parse the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON")
    }

    const quizData = JSON.parse(jsonMatch[0])

    // Ensure fileName is set correctly
    quizData.fileName = fileName

    return NextResponse.json(quizData)
  } catch (error: any) {
    console.error("[v0] Error generating quiz:", error)
    return NextResponse.json({ error: error.message || "Failed to generate quiz" }, { status: 500 })
  }
}
