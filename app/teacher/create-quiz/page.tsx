"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TeacherSidebar from "@/components/teacher/teacher-sidebar"
import TeacherMobileHeader from "@/components/teacher/teacher-mobile-header"

type Screen = "config" | "generating" | "editor"
type Difficulty = "easy" | "moderate" | "hard"

// Bloom's Taxonomy Cognitive Levels with colored icons matching the reference image
const BLOOMS_LEVELS = [
  { id: "remember", label: "Remember", description: "Recall facts and basic concepts", color: "#FF6B9D", iconBg: "linear-gradient(135deg, #FF6B9D, #FF8FB1)" },
  { id: "understand", label: "Understand", description: "Explain ideas or concepts", color: "#FFD43B", iconBg: "linear-gradient(135deg, #FFD43B, #FFE066)" },
  { id: "apply", label: "Apply", description: "Use information in new situations", color: "#CED4DA", iconBg: "linear-gradient(135deg, #ADB5BD, #CED4DA)" },
  { id: "analyze", label: "Analyze", description: "Draw connections among ideas", color: "#74C0FC", iconBg: "linear-gradient(135deg, #74C0FC, #A5D8FF)" },
  { id: "evaluate", label: "Evaluate", description: "Justify a decision or course of action", color: "#FFB347", iconBg: "linear-gradient(135deg, #FFB347, #FFCC80)" },
  { id: "create", label: "Create", description: "Produce new or original work", color: "#FFD93D", iconBg: "linear-gradient(135deg, #FFD93D, #FFE66D)" },
]

// Mock generated questions
const MOCK_QUESTIONS = [
  {
    id: "1",
    number: 1,
    level: "remember",
    question: "What are the key security features found in the old Philippine 500 peso bill?",
    options: [
      "Watermark, security thread, and color-shifting ink",
      "Hologram, microprinting, and UV features",
      "Serial number and signature only",
      "Paper texture and size dimensions"
    ],
    correct: 0,
  },
  {
    id: "2",
    number: 2,
    level: "understand",
    question: "Explain why the Bangko Sentral ng Pilipinas decided to discontinue the old 500 and 1000 peso bills.",
    options: [
      "To reduce printing costs",
      "To combat counterfeiting and improve security features",
      "To change the national heroes featured",
      "To align with international currency standards"
    ],
    correct: 1,
  },
  {
    id: "3",
    number: 3,
    level: "apply",
    question: "A cashier receives a suspicious 1000 peso bill. Which detection method should they apply first?",
    options: [
      "Check the serial number online",
      "Feel the texture and look for the watermark under light",
      "Compare it with another bill",
      "Use a magnifying glass"
    ],
    correct: 1,
  },
  {
    id: "4",
    number: 4,
    level: "analyze",
    question: "Compare the security features between the old and new series of Philippine peso bills. What is the most significant improvement?",
    options: [
      "The size of the bills",
      "The portraits featured",
      "Enhanced anti-counterfeiting technology including polymer substrate",
      "The color scheme"
    ],
    correct: 2,
  },
  {
    id: "5",
    number: 5,
    level: "evaluate",
    question: "Evaluate the effectiveness of UV light detection in identifying counterfeit Philippine currency.",
    options: [
      "Highly effective as the sole method",
      "Effective when combined with other detection methods",
      "Not effective at all",
      "Only works on new bills"
    ],
    correct: 1,
  },
]

export default function CreateQuizPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<Screen>("config")
  
  // Source file
  const [sourceFile, setSourceFile] = useState<{ name: string } | null>(null)
  
  // Config state
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["remember", "understand", "apply"])
  const [difficulty, setDifficulty] = useState<Difficulty>("moderate")
  const [questionCount, setQuestionCount] = useState(15)
  const [aiNotes, setAiNotes] = useState("")
  
  // Editor state
  const [questions, setQuestions] = useState(MOCK_QUESTIONS)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [editingPrompt, setEditingPrompt] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    const isTeacher = sessionStorage.getItem("isTeacher")
    if (!isTeacher) {
      router.push("/teacher/login")
      return
    }
    
    // Get selected file from session
    const fileData = sessionStorage.getItem("selectedFile")
    if (fileData) {
      setSourceFile(JSON.parse(fileData))
    } else {
      // Default file for demo
      setSourceFile({ name: "PHILIPPINE OLD 500 AND 1000 BILL DETECTION SYSTEM.pdf" })
    }
    
    setLoading(false)
  }, [router])

  const toggleLevel = (levelId: string) => {
    setSelectedLevels(prev =>
      prev.includes(levelId)
        ? prev.filter(id => id !== levelId)
        : [...prev, levelId]
    )
  }

  const handleGenerate = () => {
    setScreen("generating")
    // Simulate generation
    setTimeout(() => {
      setScreen("editor")
    }, 3000)
  }

  const handleRegenerateQuestion = () => {
    if (!editingPrompt.trim()) return
    setIsRegenerating(true)
    // Simulate AI regeneration
    setTimeout(() => {
      setQuestions(prev => prev.map((q, i) => 
        i === currentQuestion 
          ? { ...q, question: `[Regenerated based on: "${editingPrompt}"] ` + q.question }
          : q
      ))
      setIsRegenerating(false)
      setEditingPrompt("")
    }, 1500)
  }

  const handleSaveQuiz = () => {
    // In a real app, this would save to database
    alert("Quiz saved successfully! (Static prototype - no actual save)")
    router.push("/teacher/quizzes")
  }

  const handleDownloadQuiz = () => {
    // Generate a simple text version
    let content = `Quiz: ${sourceFile?.name || "Untitled Quiz"}\n`
    content += `Generated on: ${new Date().toLocaleDateString()}\n`
    content += `Difficulty: ${difficulty}\n`
    content += `Total Questions: ${questions.length}\n\n`
    content += "=" .repeat(50) + "\n\n"
    
    questions.forEach((q, i) => {
      content += `Question ${i + 1} (${q.level.toUpperCase()}):\n`
      content += `${q.question}\n\n`
      q.options.forEach((opt, j) => {
        content += `  ${String.fromCharCode(65 + j)}) ${opt}\n`
      })
      content += `\nCorrect Answer: ${String.fromCharCode(65 + q.correct)}\n`
      content += "\n" + "-".repeat(30) + "\n\n"
    })

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quiz-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentQ = questions[currentQuestion]
  const levelConfig = BLOOMS_LEVELS.find(l => l.id === currentQ?.level)

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#07071a", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)" }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .tc-cq { font-family: 'DM Sans', sans-serif; }
        .tc-cq * { box-sizing: border-box; }

        @keyframes tcBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .tc-blob { animation: tcBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        .tc-proto-banner {
          background: linear-gradient(90deg, rgba(255,212,59,0.15), rgba(255,212,59,0.05));
          border: 1px solid rgba(255,212,59,0.3);
          border-radius: 8px;
          padding: 8px 14px;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px;
        }

        .tc-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all .2s;
        }
        .tc-input::placeholder { color: rgba(255,255,255,0.25); }
        .tc-input:focus { border-color: rgba(88,214,141,0.5); background: rgba(88,214,141,0.06); }

        .tc-textarea {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all .2s;
          resize: vertical;
          min-height: 80px;
        }
        .tc-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .tc-textarea:focus { border-color: rgba(88,214,141,0.5); background: rgba(88,214,141,0.06); }

        .tc-bloom-card {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all .2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tc-bloom-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); }
        .tc-bloom-card.selected { border-color: rgba(88,214,141,0.4); background: rgba(88,214,141,0.08); }

        .tc-diff-btn {
          padding: 10px 24px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .tc-diff-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
        .tc-diff-btn.easy.selected { background: rgba(81,207,102,0.2); border-color: rgba(81,207,102,0.4); color: #51CF66; }
        .tc-diff-btn.moderate.selected { background: rgba(88,214,141,0.2); border-color: rgba(88,214,141,0.4); color: #58d68d; }
        .tc-diff-btn.hard.selected { background: rgba(255,107,107,0.2); border-color: rgba(255,107,107,0.4); color: #FF6B6B; }

        .tc-btn {
          padding: 12px 28px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .tc-btn-primary {
          background: linear-gradient(135deg, #58d68d 0%, #45b078 100%);
          color: #fff;
          box-shadow: 0 6px 20px rgba(88,214,141,0.35);
        }
        .tc-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(88,214,141,0.45); }
        .tc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .tc-btn-secondary {
          padding: 10px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
        }
        .tc-btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .tc-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 100px;
          background: rgba(255,255,255,0.1);
          outline: none;
        }
        .tc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #58d68d;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(88,214,141,0.4);
        }

        .tc-summary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 20px;
          margin-top: 24px;
        }

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-fadeup { animation: tcFadeUp .35s ease forwards; }

        @keyframes tcSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .tc-spin { animation: tcSpin 1s linear infinite; }

        @keyframes tcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .tc-pulse { animation: tcPulse 1.5s ease-in-out infinite; }

        .tc-q-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
        }
        .tc-q-btn {
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .15s;
        }
        .tc-q-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
        .tc-q-btn.active { background: rgba(88,214,141,0.2); border-color: rgba(88,214,141,0.4); color: #58d68d; }

        .tc-option {
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          transition: all .2s;
        }
        .tc-option.correct {
          background: rgba(88,214,141,0.15);
          border-color: rgba(88,214,141,0.3);
          color: #58d68d;
        }
      `}</style>

      <div className="tc-cq" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>
        <div className="tc-blob" style={{ width: 300, height: 300, background: "rgba(88,214,141,0.09)", top: -60, left: 200, animationDuration: "11s" }} />
        <div className="tc-blob" style={{ width: 220, height: 220, background: "rgba(69,176,120,0.07)", bottom: 40, right: 60, animationDuration: "15s", animationDelay: "5s" }} />

        <TeacherMobileHeader />
        <TeacherSidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }} className="pt-14 md:pt-0">
          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.4)", flex: 1 }}>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>Teacher</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
              <span style={{
                fontWeight: 600, color: "#fff",
                background: "rgba(88,214,141,0.15)",
                border: "1px solid rgba(88,214,141,0.2)",
                borderRadius: 6, padding: "2px 10px", fontSize: 12,
              }}>
                {screen === "config" ? "Configure Quiz" : screen === "generating" ? "Generating..." : "Edit Questions"}
              </span>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {["Configure", "Generate", "Edit & Save"].map((step, i) => {
                const stepNum = i + 1
                const currentStep = screen === "config" ? 1 : screen === "generating" ? 2 : 3
                const isActive = stepNum === currentStep
                const isDone = stepNum < currentStep
                return (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: isDone ? "rgba(88,214,141,0.2)" : isActive ? "rgba(88,214,141,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isDone ? "rgba(88,214,141,0.4)" : isActive ? "rgba(88,214,141,0.3)" : "rgba(255,255,255,0.1)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                      color: isDone ? "#58d68d" : isActive ? "#7dcea0" : "rgba(255,255,255,0.3)",
                    }}>
                      {isDone ? "✓" : stepNum}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>{step}</span>
                    {i < 2 && <div style={{ width: 20, height: 1, background: isDone ? "rgba(88,214,141,0.3)" : "rgba(255,255,255,0.1)", marginLeft: 4 }} />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {/* Prototype Banner */}
            <div className="tc-proto-banner">
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontSize: 12, color: "#FFD43B", fontWeight: 500 }}>
                STATIC PROTOTYPE - This section demonstrates the Teacher Portal UI. Backend functionality is not connected.
              </span>
            </div>

            {/* CONFIG SCREEN */}
            {screen === "config" && (
              <div className="tc-fadeup" style={{ maxWidth: 800, margin: "0 auto" }}>
                {/* Source File Display */}
                <div style={{ marginBottom: 28 }}>
                  <input
                    type="text"
                    className="tc-input"
                    value={sourceFile?.name?.replace(/\.[^/.]+$/, "").toUpperCase() || ""}
                    readOnly
                    style={{ fontWeight: 600, background: "rgba(255,255,255,0.08)", cursor: "default" }}
                  />
                </div>

                {/* Bloom's Taxonomy */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#58d68d", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                    Bloom&apos;s Taxonomy Levels
                  </label>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                    Select which cognitive levels to include in your quiz
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                    {BLOOMS_LEVELS.map(level => {
                      const isSelected = selectedLevels.includes(level.id)
                      return (
                        <div
                          key={level.id}
                          className={`tc-bloom-card ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleLevel(level.id)}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width: 22, height: 22, borderRadius: 6,
                            border: `1.5px solid ${isSelected ? "#58d68d" : "rgba(255,255,255,0.2)"}`,
                            background: isSelected ? "rgba(88,214,141,0.2)" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all .2s", flexShrink: 0,
                          }}>
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#58d68d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          {/* Icon */}
                          <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: level.iconBg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {level.id === "remember" && <span style={{ fontSize: 14 }}>🧠</span>}
                            {level.id === "understand" && <span style={{ fontSize: 14 }}>💡</span>}
                            {level.id === "apply" && <span style={{ fontSize: 14 }}>🔧</span>}
                            {level.id === "analyze" && <span style={{ fontSize: 14 }}>🔍</span>}
                            {level.id === "evaluate" && <span style={{ fontSize: 14 }}>⚖️</span>}
                            {level.id === "create" && <span style={{ fontSize: 14 }}>✨</span>}
                          </div>
                          {/* Text */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: level.color }}>{level.label}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {level.description}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#58d68d", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>
                    Difficulty
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["easy", "moderate", "hard"] as Difficulty[]).map(d => (
                      <button
                        key={d}
                        className={`tc-diff-btn ${d} ${difficulty === d ? "selected" : ""}`}
                        onClick={() => setDifficulty(d)}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#58d68d", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                      Questions
                    </label>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#58d68d" }}>{questionCount}</span>
                  </div>
                  <input
                    type="range"
                    className="tc-slider"
                    min={5}
                    max={50}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Additional Notes for AI */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#58d68d", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                    Additional Notes for AI
                  </label>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
                    Provide any specific instructions or context for quiz generation (optional)
                  </p>
                  <textarea
                    className="tc-textarea"
                    placeholder="E.g., Focus on security features identification, include practical scenarios for bill verification, avoid questions about historical dates..."
                    value={aiNotes}
                    onChange={(e) => setAiNotes(e.target.value)}
                  />
                </div>

                {/* Quiz Summary */}
                <div className="tc-summary">
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16 }}>
                    Quiz Summary
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Source File</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{sourceFile?.name || "No file selected"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Cognitive Levels</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{selectedLevels.length} selected</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Questions</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{questionCount}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Difficulty</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", textTransform: "capitalize" }}>{difficulty}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                  <button className="tc-btn tc-btn-secondary" onClick={() => router.push("/teacher/library")}>
                    Back
                  </button>
                  <button
                    className="tc-btn tc-btn-primary"
                    disabled={selectedLevels.length === 0}
                    onClick={handleGenerate}
                  >
                    Generate Quiz
                  </button>
                </div>
              </div>
            )}

            {/* GENERATING SCREEN */}
            {screen === "generating" && (
              <div className="tc-fadeup" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center" }}>
                <div className="tc-spin" style={{ width: 60, height: 60, border: "3px solid rgba(88,214,141,0.2)", borderTopColor: "#58d68d", borderRadius: "50%", marginBottom: 24 }} />
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                  Generating Your Quiz
                </h2>
                <p className="tc-pulse" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                  AI is analyzing your content and creating questions...
                </p>
              </div>
            )}

            {/* EDITOR SCREEN */}
            {screen === "editor" && (
              <div className="tc-fadeup" style={{ maxWidth: 900, margin: "0 auto" }}>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {/* Question Navigator */}
                  <div style={{ width: 200, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>QUESTIONS</div>
                    <div className="tc-q-nav">
                      {questions.map((q, i) => (
                        <button
                          key={q.id}
                          className={`tc-q-btn ${currentQuestion === i ? "active" : ""}`}
                          onClick={() => setCurrentQuestion(i)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    
                    {/* Save/Download */}
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                      <button className="tc-btn tc-btn-primary" onClick={handleSaveQuiz} style={{ width: "100%", padding: "10px 16px", fontSize: 13 }}>
                        Save Quiz
                      </button>
                      <button className="tc-btn tc-btn-secondary" onClick={handleDownloadQuiz} style={{ width: "100%", padding: "10px 16px", fontSize: 13 }}>
                        Download (.txt)
                      </button>
                    </div>
                  </div>

                  {/* Question Editor */}
                  <div style={{ flex: 1, minWidth: 300 }}>
                    {currentQ && (
                      <>
                        {/* Level badge */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                          <div style={{
                            padding: "4px 12px",
                            background: levelConfig?.iconBg,
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                            textTransform: "uppercase",
                          }}>
                            {currentQ.level}
                          </div>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                            Question {currentQuestion + 1} of {questions.length}
                          </span>
                        </div>

                        {/* Question */}
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1.6, marginBottom: 20 }}>
                          {currentQ.question}
                        </div>

                        {/* Options */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                          {currentQ.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`tc-option ${i === currentQ.correct ? "correct" : ""}`}
                            >
                              <span style={{ fontWeight: 700, marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>
                              {opt}
                              {i === currentQ.correct && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700 }}>✓ Correct</span>}
                            </div>
                          ))}
                        </div>

                        {/* AI Edit */}
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#58d68d", marginBottom: 10 }}>
                            EDIT WITH AI
                          </div>
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
                            Not satisfied? Tell the AI how to improve this question.
                          </p>
                          <textarea
                            className="tc-textarea"
                            placeholder="E.g., Make the question more specific about the security thread, add a scenario-based option..."
                            value={editingPrompt}
                            onChange={(e) => setEditingPrompt(e.target.value)}
                            style={{ minHeight: 60, marginBottom: 12 }}
                          />
                          <button
                            className="tc-btn tc-btn-primary"
                            onClick={handleRegenerateQuestion}
                            disabled={!editingPrompt.trim() || isRegenerating}
                            style={{ padding: "8px 20px", fontSize: 12 }}
                          >
                            {isRegenerating ? "Regenerating..." : "Regenerate Question"}
                          </button>
                        </div>

                        {/* Navigation */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                          <button
                            className="tc-btn tc-btn-secondary"
                            disabled={currentQuestion === 0}
                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                            style={{ padding: "8px 20px", fontSize: 12 }}
                          >
                            Previous
                          </button>
                          <button
                            className="tc-btn tc-btn-secondary"
                            disabled={currentQuestion === questions.length - 1}
                            onClick={() => setCurrentQuestion(prev => prev + 1)}
                            style={{ padding: "8px 20px", fontSize: 12 }}
                          >
                            Next
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
