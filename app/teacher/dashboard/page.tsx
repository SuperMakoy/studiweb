"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import TeacherSidebar from "@/components/teacher/teacher-sidebar"
import TeacherMobileHeader from "@/components/teacher/teacher-mobile-header"

// Recent files mock data
const RECENT_FILES = [
  { id: "1", name: "PHILIPPINE OLD 500 AND 1000 BILL DETECTION SYSTEM.pdf", type: "pdf", date: "2025-01-08" },
  { id: "2", name: "Introduction to Biology Chapter 1.docx", type: "docx", date: "2025-01-07" },
  { id: "3", name: "World History Notes.pdf", type: "pdf", date: "2025-01-06" },
]

// Recent quizzes mock data
const RECENT_QUIZZES = [
  { id: "1", title: "Biology Quiz - Chapter 1", questions: 15, status: "published", date: "2025-01-08" },
  { id: "2", title: "History Assessment", questions: 20, status: "draft", date: "2025-01-07" },
  { id: "3", title: "Math Fundamentals", questions: 25, status: "published", date: "2025-01-06" },
]

const FILE_ICONS: Record<string, string> = {
  pdf: "📕",
  docx: "📘",
  doc: "📘",
  txt: "📄",
}

export default function TeacherDashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [dragActive, setDragActive] = useState(false)

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
    // Store file info and go to create quiz
    sessionStorage.setItem("selectedFile", JSON.stringify({ name: file.name }))
    router.push("/teacher/create-quiz")
  }

  const handleCreateQuizFromFile = (file: typeof RECENT_FILES[0]) => {
    sessionStorage.setItem("selectedFile", JSON.stringify(file))
    router.push("/teacher/create-quiz")
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
        .tc-dash { font-family: 'DM Sans', sans-serif; }
        .tc-dash * { box-sizing: border-box; }

        @keyframes tcBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .tc-blob { animation: tcBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        .tc-proto-banner {
          background: linear-gradient(90deg, rgba(255,212,59,0.15), rgba(255,212,59,0.05));
          border: 1px solid rgba(255,212,59,0.3);
          border-radius: 8px;
          padding: 8px 14px;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 20px;
        }

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

        .tc-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 20px;
          transition: all .2s;
        }
        .tc-card:hover {
          background: rgba(88,214,141,0.06);
          border-color: rgba(88,214,141,0.2);
        }

        .tc-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .tc-btn-primary {
          background: linear-gradient(135deg, #58d68d 0%, #45b078 100%);
          color: #fff;
          box-shadow: 0 4px 14px rgba(88,214,141,0.3);
        }
        .tc-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(88,214,141,0.4); }
        .tc-btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
        }
        .tc-btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .tc-file-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          cursor: pointer;
          transition: all .2s;
        }
        .tc-file-item:hover {
          background: rgba(88,214,141,0.08);
          border-color: rgba(88,214,141,0.2);
        }

        .tc-quiz-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          cursor: pointer;
          transition: all .2s;
        }
        .tc-quiz-item:hover {
          background: rgba(88,214,141,0.08);
          border-color: rgba(88,214,141,0.2);
        }

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-fadeup { animation: tcFadeUp .35s ease forwards; }
      `}</style>

      <div className="tc-dash" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>
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
                Dashboard
              </span>
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

            <div className="tc-fadeup" style={{ maxWidth: 1000, margin: "0 auto" }}>
              {/* Welcome */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
                  Welcome back, {teacherName}!
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                  Upload study materials and create AI-powered quizzes with Bloom&apos;s Taxonomy alignment.
                </p>
              </div>

              {/* Quick Upload Section */}
              <div className="tc-card" style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Quick Upload</h2>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
                      Upload a file to start creating a quiz immediately
                    </p>
                  </div>
                  <button className="tc-btn tc-btn-secondary" onClick={() => router.push("/teacher/library")}>
                    View Library
                  </button>
                </div>

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
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
                    Drop your file here or click to browse
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                    Supports TXT, DOC, DOCX, PDF up to 5MB
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                {/* Recent Files */}
                <div className="tc-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>Recent Files</h2>
                    <button
                      onClick={() => router.push("/teacher/library")}
                      style={{ fontSize: 11, color: "#58d68d", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      View All
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {RECENT_FILES.map(file => (
                      <div
                        key={file.id}
                        className="tc-file-item"
                        onClick={() => handleCreateQuizFromFile(file)}
                      >
                        <div style={{ fontSize: 24 }}>{FILE_ICONS[file.type] || "📄"}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{file.date}</div>
                        </div>
                        <div style={{ fontSize: 10, color: "#58d68d", fontWeight: 600 }}>Create Quiz</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Quizzes */}
                <div className="tc-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>Recent Quizzes</h2>
                    <button
                      onClick={() => router.push("/teacher/quizzes")}
                      style={{ fontSize: 11, color: "#58d68d", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      View All
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {RECENT_QUIZZES.map(quiz => (
                      <div
                        key={quiz.id}
                        className="tc-quiz-item"
                        onClick={() => router.push("/teacher/quizzes")}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: quiz.status === "published" ? "rgba(81,207,102,0.15)" : "rgba(255,212,59,0.15)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16,
                        }}>
                          {quiz.status === "published" ? "✓" : "📝"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {quiz.title}
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                            {quiz.questions} questions • {quiz.date}
                          </div>
                        </div>
                        <div style={{
                          fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                          padding: "3px 8px", borderRadius: 100,
                          background: quiz.status === "published" ? "rgba(81,207,102,0.15)" : "rgba(255,212,59,0.15)",
                          color: quiz.status === "published" ? "#51CF66" : "#FFD43B",
                        }}>
                          {quiz.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 24 }}>
                {[
                  { label: "Total Quizzes", value: "12", icon: "📝", color: "#58d68d" },
                  { label: "Published", value: "8", icon: "✓", color: "#51CF66" },
                  { label: "Drafts", value: "4", icon: "📋", color: "#FFD43B" },
                  { label: "Files Uploaded", value: "6", icon: "📁", color: "#7f9fff" },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    padding: "16px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
