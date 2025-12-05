// API route to extract content from uploaded files
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { extractFileContent } from "@/lib/file-extraction-service"

export async function POST(request: NextRequest) {
  try {
    const { fileId, userId } = await request.json()

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

    // Extract content based on file type
    const extractedContent = await extractFileContent(base64Data, fileType, fileName)

    return NextResponse.json({
      success: true,
      fileName,
      fileType,
      content: extractedContent,
      contentLength: extractedContent.length,
    })
  } catch (error: any) {
    console.error("[v0] Error extracting content:", error)
    return NextResponse.json({ error: error.message || "Failed to extract content" }, { status: 500 })
  }
}
