// AI Service for handling quiz generation and file processing

export async function processFileAndGenerateQuiz(file: File) {
  try {
    // Step 1: Process the file
    const formData = new FormData()
    formData.append("file", file)

    const processResponse = await fetch("/api/process-file", {
      method: "POST",
      body: formData,
    })

    if (!processResponse.ok) {
      throw new Error("Failed to process file")
    }

    const processedData = await processResponse.json()

    // Step 2: Generate quiz from file content
    const quizResponse = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileContent: processedData.content,
        fileName: processedData.fileName,
      }),
    })

    if (!quizResponse.ok) {
      throw new Error("Failed to generate quiz")
    }

    const quizData = await quizResponse.json()
    return quizData
  } catch (error) {
    console.error("Error in AI service:", error)
    throw error
  }
}

export async function generateQuizFromText(text: string, fileName: string) {
  try {
    const response = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileContent: text,
        fileName: fileName,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate quiz")
    }

    return await response.json()
  } catch (error) {
    console.error("Error generating quiz:", error)
    throw error
  }
}
