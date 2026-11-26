import { type NextRequest, NextResponse } from "next/server"
import { BackendError, isDocumentId, studentBackend } from "@/lib/server-firestore"
import { extractFileContent } from "@/lib/file-extraction-service"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const backend = await studentBackend(request)
    const { fileId, userId } = await request.json()
    if (userId !== undefined && userId !== backend.uid) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    if (!isDocumentId(fileId)) return NextResponse.json({ error: "Invalid file ID" }, { status: 400 })
    const { fileData, fileType, fileName } = await backend.readOwnedFile(fileId)
    const content = await extractFileContent(fileData, fileType, fileName)
    return NextResponse.json({ success: true, fileName, fileType, content, contentLength: content.length },
      { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof BackendError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error("[STUDI] Extraction failed", error instanceof Error ? error.name : "unknown")
    return NextResponse.json({ error: "Failed to extract content" }, { status: 500 })
  }
}
