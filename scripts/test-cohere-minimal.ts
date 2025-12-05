import * as fs from "fs"
import * as path from "path"

const envPath = path.join(process.cwd(), ".env.local")
const envContent = fs.readFileSync(envPath, "utf-8")
const envLines = envContent.split("\n")

envLines.forEach((line) => {
  const [key, value] = line.split("=")
  if (key && value) {
    process.env[key.trim()] = value.trim()
  }
})

async function testCohereAPI() {
  const apiKey = process.env.COHERE_API_KEY

  if (!apiKey) {
    console.error("[v0] COHERE_API_KEY not set in environment")
    return
  }

  console.log("[v0] API Key found (length:", apiKey.length, ")")
  console.log("[v0] Testing Cohere Chat API...")

  const requestBody = {
    model: "command",
    messages: [
      {
        role: "user",
        content: "Hello, just testing if you can respond.",
      },
    ],
    max_tokens: 100,
  }

  console.log("[v0] Request body:", JSON.stringify(requestBody, null, 2))
  console.log("[v0] Auth header: Bearer", apiKey.substring(0, 10) + "...")

  try {
    const response = await fetch("https://api.cohere.com/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Response status:", response.status)
    const text = await response.text()
    console.log("[v0] Response body:", text)

    if (response.ok) {
      const data = JSON.parse(text)
      console.log("[v0] Success! Cohere response:", data.text)
    } else {
      console.log("[v0] Failed response - trying alternative endpoint...")
      // Try with just the key as auth
      const response2 = await fetch("https://api.cohere.com/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      })
      console.log("[v0] Alternative auth response status:", response2.status)
      const text2 = await response2.text()
      console.log("[v0] Alternative response body:", text2)
    }
  } catch (error: any) {
    console.error("[v0] Error:", error.message)
  }
}

testCohereAPI()
