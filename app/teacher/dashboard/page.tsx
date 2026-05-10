"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import TeacherSidebar from "@/components/teacher/teacher-sidebar"
import TeacherMobileHeader from "@/components/teacher/teacher-mobile-header"

type Difficulty = "easy" | "moderate" | "hard"
type Screen = "upload" | "config" | "success"

// Bloom's Taxonomy Cognitive Levels
const BLOOMS_LEVELS = [
  { id: "remember", label: "Remember", description: "Recall facts and basic concepts", color: "#7f9fff", icon: "🧠" },
  { id: "understand", label: "Understand", description: "Explain ideas or concepts", color: "#5dade2", icon: "💡" },
  { id: "apply", label: "Apply", description: "Use information in new situations", color: "#58d68d", icon: "🔧" },
  { id: "analyze", label: "Analyze", description: "Draw connections among ideas", color: "#f8c471", icon: "🔍" },
  { id: "evaluate", label: "Evaluate", description: "Justify a decision or course of action", color: "#eb984e", icon: "⚖️" },
  { id: "create", label: "Create", description: "Produce new or original work", color: "#f1948a", icon: "✨" },
]

const DIFF_CONFIG = {
  easy: { color: "#51CF66", bg: "rgba(81,207,102,0.15)", border: "rgba(81,207,102,0.3)" },
  moderate: { color: "#FFD43B", bg: "rgba(255,212,59,0.15)", border: "rgba(255,212,59,0.3)" },
  hard: { color: "#FF6B6B", bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.3)" },
}

export default function TeacherDashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<Screen>("upload")

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Config state
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["remember", "understand", "apply"])
  const [difficulty, setDifficulty] = useState<Difficulty>("moderate")
  const [questionCount, setQuestionCount] = useState(15)
  const [quizTitle, setQuizTitle] = useState("")
  const [timeLimit, setTimeLimit] = useState(30)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const isTeacher = sessionStorage.getItem("isTeacher")
    if (!isTeacher) {
      router.push("/teacher/login")
      return
    }
    setLoading(false)
  }, [router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const processFile = (file: File) => {
    const validTypes = ["text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      alert("Only TXT, DOC, DOCX, and PDF files are supported")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }
    setUploadedFile(file)
    setQuizTitle(file.name.replace(/\.[^/.]+$/, ""))
  }

  const toggleLevel = (levelId: string) => {
    setSelectedLevels(prev =>
      prev.includes(levelId)
        ? prev.filter(id => id !== levelId)
        : [...prev, levelId]
    )
  }

  const handleGenerate = () => {
    setGenerating(true)
    // Simulate generation (static prototype)
    setTimeout(() => {
      setGenerating(false)
      setScreen("success")
    }, 2000)
  }

  const handleCreateAnother = () => {
    setScreen("upload")
    setUploadedFile(null)
    setSelectedLevels(["remember", "understand", "apply"])
    setDifficulty("moderate")
    setQuestionCount(15)
    setQuizTitle("")
    setTimeLimit(30)
  }

  const teacherName = typeof window !== "undefined" ? sessionStorage.getItem("teacherName") || "Teacher" : "Teacher"

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
        .tc-db { font-family: 'DM Sans', sans-serif; }
        .tc-db * { box-sizing: border-box; }

        @keyframes tcBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .tc-blob { animation: tcBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-fadeup { animation: tcFadeUp .35s ease forwards; }

        /* Dropzone */
        .tc-dropzone {
          border: 2px dashed rgba(88,214,141,0.3);
          border-radius: 16px;
          padding: 40px 30px;
          text-align: center;
          cursor: pointer;
          transition: all .25s;
          background: rgba(88,214,141,0.04);
        }
        .tc-dropzone:hover, .tc-dropzone.active {
          border-color: rgba(88,214,141,0.6);
          background: rgba(88,214,141,0.1);
          transform: translateY(-2px);
        }

        /* Bloom's level card */
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
        .tc-bloom-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.15);
        }
        .tc-bloom-card.selected {
          border-color: rgba(88,214,141,0.4);
          background: rgba(88,214,141,0.08);
        }

        /* Input styles */
        .tc-input {
          width: 100%;
          padding: 11px 14px;
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
        .tc-input:focus {
          border-color: rgba(88,214,141,0.5);
          background: rgba(88,214,141,0.08);
        }

        /* Primary button */
        .tc-btn-primary {
          padding: 12px 28px;
          border: none;
          border-radius: 11px;
          background: linear-gradient(135deg, #58d68d 0%, #45b078 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
          box-shadow: 0 6px 20px rgba(88,214,141,0.35);
        }
        .tc-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88,214,141,0.45);
        }
        .tc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Secondary button */
        .tc-btn-secondary {
          padding: 10px 20px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .tc-btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
          color: #fff;
        }

        @keyframes tcSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .tc-spin { animation: tcSpin 1s linear infinite; }

        @keyframes tcPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .tc-pulse { animation: tcPulse 2s ease-in-out infinite; }

        @keyframes tcCheckmark {
          from { stroke-dashoffset: 50; }
          to { stroke-dashoffset: 0; }
        }
        .tc-checkmark { animation: tcCheckmark 0.5s ease forwards; animation-delay: 0.2s; }
      `}</style>

      <div className="tc-db" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>

        {/* Ambient blobs */}
        <div className="tc-blob" style={{ width: 300, height: 300, background: "rgba(88,214,141,0.09)", top: -60, left: 200, animationDuration: "11s" }} />
        <div className="tc-blob" style={{ width: 220, height: 220, background: "rgba(69,176,120,0.07)", bottom: 40, right: 60, animationDuration: "15s", animationDelay: "5s" }} />

        <TeacherMobileHeader />
        <TeacherSidebar />

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }} className="pt-14 md:pt-0">

          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 10,
          }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.4)", flex: 1 }}>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>Teacher</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
              <span style={{
                fontWeight: 600, color: "#fff",
                background: "rgba(88,214,141,0.15)",
                border: "1px solid rgba(88,214,141,0.2)",
                borderRadius: 6, padding: "2px 10px", fontSize: 12,
              }}>
                {screen === "upload" ? "Upload Content" : screen === "config" ? "Configure Quiz" : "Quiz Created"}
              </span>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {["Upload", "Configure", "Done"].map((step, i) => {
                const stepNum = i + 1
                const currentStep = screen === "upload" ? 1 : screen === "config" ? 2 : 3
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
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      color: isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                    }}>{step}</span>
                    {i < 2 && (
                      <div style={{
                        width: 20, height: 1,
                        background: isDone ? "rgba(88,214,141,0.3)" : "rgba(255,255,255,0.1)",
                        marginLeft: 4,
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

            {/* UPLOAD SCREEN */}
            {screen === "upload" && (
              <div className="tc-fadeup" style={{ maxWidth: 700, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                    Upload Study Material
                  </h1>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                    Upload your content and we&apos;ll generate quiz questions aligned with Bloom&apos;s Taxonomy
                  </p>
                </div>

                {/* Dropzone */}
                <div
                  className={`tc-dropzone ${dragActive ? "active" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  
                  {uploadedFile ? (
                    <>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#58d68d", marginBottom: 4 }}>
                        {uploadedFile.name}
                      </div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </div>
                      <button
                        className="tc-btn-secondary"
                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null) }}
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
                        Drop your file here or click to browse
                      </div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                        Supports TXT, DOC, DOCX, PDF up to 5MB
                      </div>
                    </>
                  )}
                </div>

                {/* Continue button */}
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button
                    className="tc-btn-primary"
                    disabled={!uploadedFile}
                    onClick={() => setScreen("config")}
                  >
                    Continue to Configure
                  </button>
                </div>

                {/* Tips */}
                <div style={{ marginTop: 40, padding: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
                    Tips for best results
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      "Upload well-structured content with clear headings and sections",
                      "Include key concepts, definitions, and important facts",
                      "Longer documents generate more diverse questions",
                    ].map((tip, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(88,214,141,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#58d68d", flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONFIG SCREEN */}
            {screen === "config" && (
              <div className="tc-fadeup" style={{ maxWidth: 800, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                    Configure Your Quiz
                  </h1>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                    Select cognitive levels and customize quiz parameters
                  </p>
                </div>

                {/* Quiz Title */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    className="tc-input"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title..."
                  />
                </div>

                {/* Bloom's Taxonomy Selection */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                    Bloom&apos;s Taxonomy Levels
                  </label>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                    Select which cognitive levels to include in your quiz
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                    {BLOOMS_LEVELS.map(level => {
                      const isSelected = selectedLevels.includes(level.id)
                      return (
                        <div
                          key={level.id}
                          className={`tc-bloom-card ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleLevel(level.id)}
                          style={isSelected ? { borderColor: level.color + "66" } : {}}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width: 20, height: 20, borderRadius: 6,
                            border: `1.5px solid ${isSelected ? level.color : "rgba(255,255,255,0.2)"}`,
                            background: isSelected ? level.color + "22" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all .2s", flexShrink: 0,
                          }}>
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6l2.5 2.5 4.5-5" stroke={level.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Icon */}
                          <span style={{ fontSize: 18 }}>{level.icon}</span>
                          
                          {/* Text */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? level.color : "rgba(255,255,255,0.7)" }}>
                              {level.label}
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {level.description}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Settings Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
                  
                  {/* Difficulty */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                      Difficulty
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["easy", "moderate", "hard"] as Difficulty[]).map(d => (
                        <button
                          key={d}
                          suppressHydrationWarning
                          onClick={() => setDifficulty(d)}
                          style={{
                            flex: 1, padding: "10px 8px", borderRadius: 10,
                            fontSize: 13, fontWeight: 600,
                            border: `1px solid ${difficulty === d ? DIFF_CONFIG[d].border : "rgba(255,255,255,0.08)"}`,
                            background: difficulty === d ? DIFF_CONFIG[d].bg : "rgba(255,255,255,0.04)",
                            color: difficulty === d ? DIFF_CONFIG[d].color : "rgba(255,255,255,0.4)",
                            cursor: "pointer", transition: "all .15s",
                            fontFamily: "inherit", textTransform: "capitalize",
                          }}
                        >{d}</button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                      <span>Questions</span>
                      <span style={{ color: "#58d68d" }}>{questionCount}</span>
                    </label>
                    <input
                      suppressHydrationWarning
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={questionCount}
                      onChange={e => setQuestionCount(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#58d68d" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                      <span>5</span>
                      <span>50</span>
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div>
                    <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                      <span>Time Limit</span>
                      <span style={{ color: "#58d68d" }}>{timeLimit} min</span>
                    </label>
                    <input
                      suppressHydrationWarning
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={timeLimit}
                      onChange={e => setTimeLimit(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#58d68d" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                      <span>10 min</span>
                      <span>120 min</span>
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div style={{ padding: 20, background: "rgba(88,214,141,0.06)", border: "1px solid rgba(88,214,141,0.15)", borderRadius: 14, marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>
                    Quiz Summary
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Source File</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{uploadedFile?.name || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Cognitive Levels</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{selectedLevels.length} selected</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Questions</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{questionCount}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Time Limit</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{timeLimit} minutes</div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button className="tc-btn-secondary" onClick={() => setScreen("upload")}>
                    Back
                  </button>
                  <button
                    className="tc-btn-primary"
                    disabled={selectedLevels.length === 0 || generating}
                    onClick={handleGenerate}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {generating ? (
                      <>
                        <svg className="tc-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                          <path d="M8 2A6 6 0 0114 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Generating Quiz...
                      </>
                    ) : (
                      "Generate Quiz"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* SUCCESS SCREEN */}
            {screen === "success" && (
              <div className="tc-fadeup" style={{ maxWidth: 500, margin: "0 auto", textAlign: "center", paddingTop: 40 }}>
                {/* Success icon */}
                <div
                  className="tc-pulse"
                  style={{
                    width: 100, height: 100, borderRadius: "50%",
                    background: "rgba(88,214,141,0.15)",
                    border: "2px solid rgba(88,214,141,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px",
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="#58d68d" strokeWidth="2" fill="rgba(88,214,141,0.1)" />
                    <path
                      className="tc-checkmark"
                      d="M14 24l7 7 13-14"
                      stroke="#58d68d"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      strokeDasharray="50"
                      strokeDashoffset="50"
                    />
                  </svg>
                </div>

                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>
                  Quiz Created!
                </h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: "0 0 32px", lineHeight: 1.6 }}>
                  Your quiz &quot;{quizTitle}&quot; has been generated with {questionCount} questions across {selectedLevels.length} cognitive levels.
                </p>

                {/* Quiz details */}
                <div style={{ padding: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, marginBottom: 32, textAlign: "left" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Questions</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#58d68d" }}>{questionCount}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Time Limit</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#58d68d" }}>{timeLimit} min</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Difficulty</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: DIFF_CONFIG[difficulty].color, textTransform: "capitalize" }}>{difficulty}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Cognitive Levels</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{selectedLevels.length} levels</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button className="tc-btn-primary" onClick={() => router.push("/teacher/quizzes")}>
                    View All Quizzes
                  </button>
                  <button className="tc-btn-secondary" onClick={handleCreateAnother}>
                    Create Another Quiz
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
