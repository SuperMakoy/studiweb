import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { initializeApp, getApps, App } from "firebase-admin/app"
import { Groq } from "groq-sdk"

let app: App

if (!getApps().length) {
  app = initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

const db = getFirestore()
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

interface RegenerateQuestionRequest {
  fileId: string
  originalQuestion: string
  bloomsLevel: string
  questionIndex: number
  totalQuestions: number
}

export async function POST(request: Request) {
  try {
    const body: RegenerateQuestionRequest = await request.json()
    const { fileId, originalQuestion, bloomsLevel, questionIndex, totalQuestions } = body

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    // Extract token and verify user
    const token = authHeader.replace("Bearer ", "")
    let userId: string

    try {
      const decodedToken = await getAuth().verifyIdToken(token)
      userId = decodedToken.uid
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 })
    }

    // Fetch the file content
    const fileDoc = await db.collection("users").doc(userId).collection("teacherFiles").doc(fileId).get()

    if (!fileDoc.exists()) {
      return new Response(JSON.stringify({ error: "File not found" }), { status: 404 })
    }

    const fileData = fileDoc.data()
    const fileContent = fileData?.fileData

    if (!fileContent) {
      return new Response(JSON.stringify({ error: "File content not found" }), { status: 404 })
    }

    // Create a prompt for regenerating a single question at a specific Bloom's level
    const systemPrompt = `You are an expert educator creating high-quality quiz questions aligned with Bloom's Taxonomy.

Generate ONLY ONE multiple-choice question based on the provided material.

Requirements:
- The question should target the specified Bloom's Cognitive Level
- Create 4 distinct, plausible options (A, B, C, D)
- Clearly identify the correct answer
- The question should be clear, unambiguous, and fair
- Context: This is question ${questionIndex + 1} of ${totalQuestions}

Bloom's Cognitive Levels:
1. Remember: Recall facts and basic concepts (who, what, where, when)
2. Understand: Explain ideas or concepts (summarize, classify, describe)
3. Apply: Use information in a new situation (solve, demonstrate, use)
4. Analyze: Draw connections among ideas (compare, contrast, distinguish)
5. Evaluate: Justify a decision or choice (critique, defend, recommend)
6. Create: Produce new or original work (design, construct, develop)

Respond ONLY with valid JSON in this exact format:
{
  "question": "The question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why this is the correct answer"
}

Do NOT include any text outside the JSON.`

    const userPrompt = `Material to base the question on:
${fileContent}

Generate a single multiple-choice question at the ${bloomsLevel} level of Bloom's Taxonomy.
The original question was: "${originalQuestion}"
Create a new question that explores similar concepts but is different from the original.`

    // Call Groq API to generate the question
    const message = await groq.messages.create({
      model: "mixtral-8x7b-32768",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    })

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : ""

    // Parse the JSON response
    let parsedQuestion

    try {
      parsedQuestion = JSON.parse(responseText)
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("Could not parse question response")
      }
      parsedQuestion = JSON.parse(jsonMatch[0])
    }

    return new Response(
      JSON.stringify({
        question: parsedQuestion.question,
        options: parsedQuestion.options,
        correctAnswer: parsedQuestion.correctAnswer,
        explanation: parsedQuestion.explanation,
        bloomsLevel,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("[v0] Error regenerating question:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to regenerate question",
      }),
      { status: 500 }
    )
  }
}
