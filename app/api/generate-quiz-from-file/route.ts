// API route to generate quiz from uploaded file
import { type NextRequest, NextResponse } from "next/server"
import { BackendError, isDocumentId, studentBackend } from "@/lib/server-firestore"

export const runtime = "nodejs"
import { extractFileContent } from "@/lib/file-extraction-service"

// Anderson & Krathwohl Taxonomy distribution percentages
const TAXONOMY_DISTRIBUTIONS = {
  easy: {
    Remember: 0.5,
    Understand: 0.3,
    Apply: 0.2,
    Analyze: 0,
    Evaluate: 0,
    Create: 0,
  },
  moderate: {
    Remember: 0.3,
    Understand: 0.2,
    Apply: 0.2,
    Analyze: 0.2,
    Evaluate: 0.1,
    Create: 0,
  },
  hard: {
    Remember: 0.2,
    Understand: 0.2,
    Apply: 0.2,
    Analyze: 0.2,
    Evaluate: 0.1,
    Create: 0.1,
  },
}

type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

function getTaxonomyDistribution(
  difficulty: "easy" | "moderate" | "hard",
  totalQuestions: number
): Record<CognitiveLevel, number> {
  const percentages = TAXONOMY_DISTRIBUTIONS[difficulty]
  const distribution: Record<CognitiveLevel, number> = {
    Remember: 0,
    Understand: 0,
    Apply: 0,
    Analyze: 0,
    Evaluate: 0,
    Create: 0,
  }

  let assigned = 0
  const levels: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

  // Calculate initial distribution
  for (const level of levels) {
    const count = Math.round(percentages[level] * totalQuestions)
    distribution[level] = count
    assigned += count
  }

  // Adjust for rounding errors - add/remove from Remember (always present)
  if (assigned < totalQuestions) {
    distribution.Remember += totalQuestions - assigned
  } else if (assigned > totalQuestions) {
    distribution.Remember -= assigned - totalQuestions
  }

  return distribution
}

function buildTaxonomyInstructions(distribution: Record<CognitiveLevel, number>): string {
  const lines: string[] = []
  const levels: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

  for (const level of levels) {
    if (distribution[level] > 0) {
      lines.push(`- ${distribution[level]} question(s) at ${level.toUpperCase()} level`)
    }
  }

  return lines.join("\n")
}

// Attempt to repair truncated JSON
function repairJSON(text: string): string {
  let json = text.trim()
  
  // Remove markdown code blocks if present
  const codeBlockMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    json = codeBlockMatch[1].trim()
  }
  
  // Find the start of JSON
  const startIndex = json.indexOf('{')
  if (startIndex === -1) return json
  json = json.substring(startIndex)
  
  // Count brackets to check if JSON is complete
  let braceCount = 0
  let bracketCount = 0
  let inString = false
  let lastChar = ''
  
  for (const char of json) {
    if (char === '"' && lastChar !== '\\') {
      inString = !inString
    }
    if (!inString) {
      if (char === '{') braceCount++
      if (char === '}') braceCount--
      if (char === '[') bracketCount++
      if (char === ']') bracketCount--
    }
    lastChar = char
  }
  
  // If truncated, try to close it properly
  if (braceCount > 0 || bracketCount > 0) {
    // Remove incomplete last question if present
    const lastQuestionStart = json.lastIndexOf('{"id":')
    if (lastQuestionStart > 0) {
      const beforeLastQuestion = json.substring(0, lastQuestionStart)
      // Check if the question before is complete
      if (beforeLastQuestion.includes('"cognitiveLevel"')) {
        json = beforeLastQuestion.trimEnd()
        if (json.endsWith(',')) {
          json = json.slice(0, -1)
        }
      }
    }
    
    // Close any open brackets/braces
    while (bracketCount > 0) {
      json += ']'
      bracketCount--
    }
    while (braceCount > 0) {
      json += '}'
      braceCount--
    }
  }
  
  return json
}

export async function POST(request: NextRequest) {
  try {
    const backend = await studentBackend(request)
    const { fileId, userId, length = 10, difficulty = "moderate", content } = await request.json()
    if (userId !== undefined && userId !== backend.uid) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    if (content !== undefined) {
      return NextResponse.json({ error: "Direct evaluator uploads require authorized evaluator access" }, { status: 403 })
    }
    if (!isDocumentId(fileId) || ![5, 10, 20].includes(length) ||
        !["easy", "moderate", "hard"].includes(difficulty)) {
      return NextResponse.json({ error: "Invalid quiz options" }, { status: 400 })
    }
    const file = await backend.readOwnedFile(fileId)
    const fileName = file.fileName
    const extractedContent = await extractFileContent(file.fileData, file.fileType, fileName)

    if (!extractedContent || extractedContent.length === 0) {
      return NextResponse.json({ error: "No content extracted from file" }, { status: 400 })
    }

    console.log("[v0] Generating quiz from extracted content using Groq API")
    
    // Anderson & Krathwohl Taxonomy Distribution based on difficulty
    const taxonomyDistribution = getTaxonomyDistribution(difficulty, length)
    const taxonomyInstructions = buildTaxonomyInstructions(taxonomyDistribution)
    
    const systemPrompt = `You are an expert educational quiz creator using Anderson & Krathwohl's Revised Bloom's Taxonomy. Create a quiz with ${length} multiple choice questions based on the provided study material.

COGNITIVE LEVELS (Anderson & Krathwohl Taxonomy):
1. REMEMBER - Recall facts and basic concepts (Define, List, Name, State, Identify)
2. UNDERSTAND - Explain ideas or concepts (Explain, Summarize, Describe, Interpret)
3. APPLY - Use information in new situations (Apply, Demonstrate, Solve, Use)
4. ANALYZE - Draw connections among ideas (Compare, Contrast, Differentiate, Examine)
5. EVALUATE - Justify a decision or judgment (Justify, Critique, Defend, Judge, Which is best/most effective)
6. CREATE - Produce new or original work (Design, Propose, Construct, What would you create/combine)

QUESTION DISTRIBUTION FOR THIS QUIZ:
${taxonomyInstructions}

Return ONLY valid JSON in this format:
{
  "fileName": "filename",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswers": [0],
      "type": "single",
      "cognitiveLevel": "Remember"
    }
  ]
}

Rules:
- Generate EXACTLY ${length} questions following the distribution above
- Each question MUST have a "cognitiveLevel" field with one of: "Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"
- For EVALUATE questions: Use "Which is best/most effective..." or "Judge which..." phrasing
- For CREATE questions: Use "Which design/plan would best..." or "What combination would..." phrasing
- Each question should have 4 options
- correctAnswers array contains the index(es) of correct options (0-3)
- type should be "single" for one correct answer, "multiple" for multiple correct answers
- Return ONLY valid JSON, no other text`

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b",
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
        max_tokens: 4096,
      }),
    })

    if (!groqResponse.ok) {
      const error = await groqResponse.json()
      throw new Error(`Groq API error: ${error.error?.message || "Unknown error"}`)
    }

    const groqData = await groqResponse.json()
    const text = groqData.choices[0].message.content

    // Parse the AI response - try multiple approaches with repair
    let quizData
    try {
      // First try: direct JSON parse
      quizData = JSON.parse(text)
    } catch {
      // Second try: repair and parse
      try {
        const repairedJSON = repairJSON(text)
        quizData = JSON.parse(repairedJSON)
      } catch (repairError) {
        console.error("[STUDI] JSON repair failed")
        throw new Error("Failed to parse AI response as JSON")
      }
    }

    // Ensure fileName is set correctly
    quizData.fileName = fileName

    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new BackendError(502, "Quiz generation returned no questions")
    }
    await backend.saveGeneratedQuiz({ fileId, fileName, difficulty, questions: quizData.questions })

    return NextResponse.json(quizData)
  } catch (error: any) {
    if (error instanceof BackendError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error("[STUDI] Quiz generation failed", error instanceof Error ? error.name : "unknown")
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}
