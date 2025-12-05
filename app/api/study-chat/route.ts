import { generateText } from "ai"
import { getFileContent } from "@/lib/file-service"

export async function POST(request: Request) {
  try {
    const { fileId, fileName, message, chatHistory } = await request.json()

    if (!fileId || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get file content for context
    let fileContent = ""
    try {
      const content = await getFileContent(fileId)
      fileContent = content.substring(0, 8000) // Limit context size
    } catch (error) {
      console.error("Error fetching file content:", error)
    }

    // Build conversation context
    const conversationContext = chatHistory
      .map((msg: any) => `${msg.role === "user" ? "Student" : "AI Tutor"}: ${msg.content}`)
      .join("\n\n")

    const systemPrompt = `You are an expert AI tutor helping a student study their materials. You have access to the student's study document titled "${fileName}".

Your role is to:
- Answer questions clearly and concisely
- Explain concepts in an easy-to-understand way
- Provide examples when helpful
- Create practice questions or quizzes when asked
- Encourage active learning
- Be patient and supportive

Study Material Context:
${fileContent}

Previous Conversation:
${conversationContext}

Respond naturally and helpfully to the student's question.`

    const { text } = await generateText({
      model: "groq/llama-3.3-70b-versatile",
      system: systemPrompt,
      prompt: `Student's Question: ${message}`,
    })

    return Response.json({ response: text })
  } catch (error: any) {
    console.error("Error in study chat:", error)
    return Response.json({ error: error.message || "Failed to process message" }, { status: 500 })
  }
}
