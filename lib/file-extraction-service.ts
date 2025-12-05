// Service for extracting content from different file types

export async function extractFileContent(fileData: string, fileType: string, fileName: string): Promise<string> {
  try {
    if (fileType === "text/plain") {
      return extractTextFile(fileData)
    } else if (fileType === "application/pdf") {
      return await extractPdfContent(fileData)
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      return await extractDocxContent(fileData)
    } else if (
      fileType === "application/vnd.presentationml.presentation" ||
      fileType === "application/vnd.ms-powerpoint"
    ) {
      return await extractPptContent(fileData)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }
  } catch (error) {
    console.error("[v0] Error extracting file content:", error)
    throw error
  }
}

function extractTextFile(fileData: string): string {
  try {
    // Decode base64 to text
    const binaryString = atob(fileData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const decoder = new TextDecoder("utf-8")
    return decoder.decode(bytes).trim()
  } catch (error) {
    console.error("[v0] Error extracting text file:", error)
    throw new Error("Failed to extract text from file")
  }
}

async function extractPdfContent(fileData: string): Promise<string> {
  try {
    const pdfjs = await import("pdfjs-dist")
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

    const binaryString = atob(fileData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const pdf = await pdfjs.getDocument(bytes).promise
    let text = ""

    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")
      text += pageText + "\n"
    }

    return text.trim().substring(0, 10000) // Limit to 10k chars
  } catch (error) {
    console.error("[v0] Error extracting PDF:", error)
    throw new Error("Failed to extract text from PDF. PDF might be corrupted or encrypted.")
  }
}

async function extractDocxContent(fileData: string): Promise<string> {
  try {
    const mammoth = await import("mammoth")

    const binaryString = atob(fileData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    console.log("[v0] DOCX extraction - Buffer size:", bytes.length)
    console.log("[v0] DOCX extraction - First bytes:", bytes.slice(0, 10))

    // Try using Buffer.from for Node.js environment
    let result
    try {
      // First try with Node.js Buffer
      const buffer = Buffer.from(bytes)
      result = await mammoth.extractRawText({ buffer })
    } catch (err) {
      console.log("[v0] Buffer approach failed, trying arrayBuffer")
      // Fallback to arrayBuffer
      result = await mammoth.extractRawText({ arrayBuffer: bytes.buffer })
    }

    if (!result || !result.value || result.value.trim().length === 0) {
      throw new Error("No text extracted from document")
    }

    console.log("[v0] DOCX extraction - Extracted text length:", result.value.length)
    return result.value.trim().substring(0, 10000)
  } catch (error) {
    console.error("[v0] Error extracting DOCX:", error)
    throw new Error("Failed to extract text from Word document. Please ensure the file is a valid .docx format.")
  }
}

async function extractPptContent(fileData: string): Promise<string> {
  try {
    // Dynamic import
    const pptxgen = await import("pptxgenjs")

    const binaryString = atob(fileData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // For PPT, we use unzipper to extract text from XML
    const JSZip = (await import("jszip")).default
    const zip = new JSZip()
    await zip.loadAsync(bytes)

    let text = ""
    const slideFiles = Object.keys(zip.files).filter((f) => f.includes("slide") && f.endsWith(".xml"))

    for (const slideFile of slideFiles.slice(0, 50)) {
      const content = await zip.files[slideFile].async("text")
      // Simple regex to extract text from XML
      const matches = content.match(/<a:t>([^<]+)<\/a:t>/g)
      if (matches) {
        text += matches.map((m) => m.replace(/<a:t>|<\/a:t>/g, "")).join(" ") + "\n"
      }
    }

    return text.trim().substring(0, 10000)
  } catch (error) {
    console.error("[v0] Error extracting PPT:", error)
    throw new Error("Failed to extract text from PowerPoint file")
  }
}
