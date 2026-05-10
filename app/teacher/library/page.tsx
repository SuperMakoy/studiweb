"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TeacherSidebar from "@/components/teacher/teacher-sidebar"
import TeacherMobileHeader from "@/components/teacher/teacher-mobile-header"

// Static mock files for prototype
const MOCK_FILES = [
  { id: "1", name: "PHILIPPINE OLD 500 AND 1000 BILL DETECTION SYSTEM.pdf", type: "pdf", size: "2.4 MB", date: "2025-01-08" },
  { id: "2", name: "Introduction to Biology Chapter 1.docx", type: "docx", size: "1.2 MB", date: "2025-01-07" },
  { id: "3", name: "World History Notes.pdf", type: "pdf", size: "3.1 MB", date: "2025-01-06" },
  { id: "4", name: "Mathematics Fundamentals.txt", type: "txt", size: "156 KB", date: "2025-01-05" },
  { id: "5", name: "Chemistry Lab Manual.pdf", type: "pdf", size: "4.5 MB", date: "2025-01-04" },
  { id: "6", name: "Physics Motion Laws Summary.docx", type: "docx", size: "890 KB", date: "2025-01-03" },
]

const FILE_ICONS: Record<string, string> = {
  pdf: "📕",
  docx: "📘",
  doc: "📘",
  txt: "📄",
}

export default function TeacherLibraryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState(MOCK_FILES)
  const [search, setSearch] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  useEffect(() => {
    const isTeacher = sessionStorage.getItem("isTeacher")
    if (!isTeacher) {
      router.push("/teacher/login")
      return
    }
    setLoading(false)
  }, [router])

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleCreateQuiz = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      sessionStorage.setItem("selectedFile", JSON.stringify(file))
      router.push("/teacher/create-quiz")
    }
  }

  const handleDeleteSelected = () => {
    setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)))
    setSelectedFiles([])
  }

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
        .tc-lib { font-family: 'DM Sans', sans-serif; }
        .tc-lib * { box-sizing: border-box; }

        @keyframes tcBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .tc-blob { animation: tcBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        .tc-search {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 6px 12px 6px 32px;
          color: #fff; font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none; width: 200px;
          transition: all .2s;
        }
        .tc-search::placeholder { color: rgba(255,255,255,0.25); }
        .tc-search:focus { border-color: rgba(88,214,141,0.5); background: rgba(88,214,141,0.07); width: 240px; }

        .tc-file-row {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all .2s;
        }
        .tc-file-row:hover {
          background: rgba(88,214,141,0.06);
          border-color: rgba(88,214,141,0.2);
        }
        .tc-file-row.selected {
          background: rgba(88,214,141,0.1);
          border-color: rgba(88,214,141,0.3);
        }

        .tc-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
        }
        .tc-btn-primary {
          background: linear-gradient(135deg, #58d68d 0%, #45b078 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(88,214,141,0.3);
        }
        .tc-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(88,214,141,0.4); }
        .tc-btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
        }
        .tc-btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .tc-btn-danger {
          background: rgba(255,107,107,0.15);
          border: 1px solid rgba(255,107,107,0.3);
          color: #FF6B6B;
        }
        .tc-btn-danger:hover { background: rgba(255,107,107,0.25); }

        .tc-checkbox {
          width: 18px; height: 18px;
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 5px;
          background: transparent;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .15s;
          flex-shrink: 0;
        }
        .tc-checkbox.checked {
          background: #58d68d;
          border-color: #58d68d;
        }

        .tc-proto-banner {
          background: linear-gradient(90deg, rgba(255,212,59,0.15), rgba(255,212,59,0.05));
          border: 1px solid rgba(255,212,59,0.3);
          border-radius: 8px;
          padding: 8px 14px;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px;
        }

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-fadeup { animation: tcFadeUp .3s ease forwards; }
      `}</style>

      <div className="tc-lib" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>
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
            position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap",
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
                File Library
              </span>
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.35 }}>
                <circle cx="5.5" cy="5.5" r="4" stroke="#fff" strokeWidth="1.2" />
                <path d="M9 9l2.5 2.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                className="tc-search"
                placeholder="Search files..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {selectedFiles.length > 0 && (
              <button className="tc-btn tc-btn-danger" onClick={handleDeleteSelected}>
                Delete ({selectedFiles.length})
              </button>
            )}

            <button className="tc-btn tc-btn-primary" onClick={() => router.push("/teacher/dashboard")}>
              + Upload File
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {/* Prototype Banner */}
            <div className="tc-proto-banner">
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontSize: 12, color: "#FFD43B", fontWeight: 500 }}>
                STATIC PROTOTYPE - This section demonstrates the Teacher Portal UI. Backend functionality is not connected.
              </span>
            </div>

            <div className="tc-fadeup">
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
                  File Library
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  Manage your uploaded study materials. Select a file to create a quiz.
                </p>
              </div>

              {/* File List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredFiles.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
                    <div>No files found</div>
                  </div>
                ) : (
                  filteredFiles.map(file => (
                    <div
                      key={file.id}
                      className={`tc-file-row ${selectedFiles.includes(file.id) ? "selected" : ""}`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`tc-checkbox ${selectedFiles.includes(file.id) ? "checked" : ""}`}
                        onClick={(e) => { e.stopPropagation(); toggleSelect(file.id) }}
                      >
                        {selectedFiles.includes(file.id) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {/* Icon */}
                      <div style={{ fontSize: 28 }}>{FILE_ICONS[file.type] || "📄"}</div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                          {file.size} • Uploaded {file.date}
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        className="tc-btn tc-btn-primary"
                        onClick={(e) => { e.stopPropagation(); handleCreateQuiz(file.id) }}
                        style={{ padding: "6px 14px", fontSize: 11 }}
                      >
                        Create Quiz
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
