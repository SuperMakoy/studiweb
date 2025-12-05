/**
 * Test script to verify Cohere AI integration
 * This tests the quiz generation endpoint with sample study material
 */

async function testCohereIntegration() {
  try {
    console.log("Starting Cohere integration test...\n")

    const sampleContent = `
    The Photosynthesis Process:
    Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of glucose.
    
    The process occurs in two main stages:
    1. Light-dependent reactions (in the thylakoid)
    2. Light-independent reactions or Calvin Cycle (in the stroma)
    
    During light reactions, chlorophyll absorbs photons and energizes electrons. These electrons move through an electron transport chain, creating ATP and NADPH.
    
    The Calvin Cycle uses ATP and NADPH to convert CO2 into glucose through a series of reactions involving RuBP and 3-PG molecules.
    `

    const response = await fetch("http://localhost:3000/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileContent: sampleContent,
        fileName: "photosynthesis-notes.txt",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Error from API:", error)
      throw new Error(`API returned status ${response.status}`)
    }

    const quizData = await response.json()
    console.log("Success! Generated quiz:\n")
    console.log(JSON.stringify(quizData, null, 2))

    // Validate the quiz structure
    if (!quizData.questions || quizData.questions.length === 0) {
      throw new Error("No questions generated")
    }

    console.log(`\nValidation passed! Generated ${quizData.questions.length} questions`)
    console.log("Cohere integration is working correctly!")
  } catch (error) {
    console.error("Test failed:", error)
    process.exit(1)
  }
}

testCohereIntegration()
