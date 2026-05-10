"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TeacherSidebar from "@/components/teacher/teacher-sidebar"
import TeacherMobileHeader from "@/components/teacher/teacher-mobile-header"

// Static mock data - only draft quizzes
const DRAFT_QUIZZES = [
  { id: "4", title: "English Literature Review", questions: 12, difficulty: "easy", date: "2025-01-05" },
  { id: "6", title: "Physics Motion Laws", questions: 20, difficulty: "hard", date: "2025-01-03" },
  { id: "9", title: "Art History Renaissance", questions: 12, difficulty: "moderate", date: "2024-12-30" },
  { id: "12", title: "Psychology Concepts", questions: 16, difficulty: "moderate", date: "2024-12-20" },
]

const DIFF_CONFIG = {
  easy: { color: "#51CF66", bg: "rgba(81,207,102,0.15)", border: "rgba(81,207,102,0.3)" },
  moderate: { color: "#FFD43B", bg: "rgba(255,212,59,0.15)", border: "rgba(255,212,59,0.3)" },
  hard: { color: "#FF6B6B", bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.3)" },
}

export default function TeacherDraftsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const isTeacher = sessionStorage.getItem("isTeacher")
    if (!isTeacher) {
      router.push("/teacher/login")
      return
    }
    setLoading(false)
  }, [router])

  const filteredQuizzes = DRAFT_QUIZZES.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase())
  )

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
        .tc-drafts { font-family: 'DM Sans', sans-serif; }
        .tc-drafts * { box-sizing: border-box; }

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

        .tc-quiz-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          transition: all .2s;
        }
        .tc-quiz-card:hover {
          background: rgba(88,214,141,0.06);
          border-color: rgba(88,214,141,0.25);
          transform: translateY(-2px);
        }

        .tc-btn {
          padding: 6px 14px;
          border: none;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
          background: rgba(88,214,141,0.15);
          border: 1px solid rgba(88,214,141,0.3);
          color: #58d68d;
        }
        .tc-btn:hover { background: rgba(88,214,141,0.25); }

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-grid-item { animation: tcFadeUp .3s ease forwards; opacity: 0; }
        .tc-grid-item:nth-child(1) { animation-delay: .04s; }
        .tc-grid-item:nth-child(2) { animation-delay: .08s; }
        .tc-grid-item:nth-child(3) { animation-delay: .12s; }
        .tc-grid-item:nth-child(4) { animation-delay: .16s; }
      `}</style>

      <div className="tc-drafts" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>
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
                fontWeight: 600, color: "#FFD43B",
                background: "rgba(255,212,59,0.15)",
                border: "1px solid rgba(255,212,59,0.25)",
                borderRadius: 6, padding: "2px 10px", fontSize: 12,
              }}>
                Draft Quizzes ({DRAFT_QUIZZES.length})
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
                placeholder="Search drafts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            <div className="tc-proto-banner">
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontSize: 12, color: "#FFD43B", fontWeight: 500 }}>
                STATIC PROTOTYPE - This section demonstrates the Teacher Portal UI. Backend functionality is not connected.
              </span>
            </div>

            {filteredQuizzes.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
                <div style={{ fontSize: 40, opacity: 0.3 }}>📝</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
                  {search ? `No drafts matching "${search}"` : "No draft quizzes yet"}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {filteredQuizzes.map((quiz) => {
                  const diff = DIFF_CONFIG[quiz.difficulty as keyof typeof DIFF_CONFIG]
                  return (
                    <div key={quiz.id} className="tc-quiz-card tc-grid-item">
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {quiz.title}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{quiz.date}</div>
                        </div>
                        <div style={{
                          fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                          padding: "3px 8px", borderRadius: 100,
                          background: "rgba(255,212,59,0.15)",
                          color: "#FFD43B",
                          border: "1px solid rgba(255,212,59,0.3)",
                        }}>
                          Draft
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#58d68d" }}>{quiz.questions}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Questions</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{
                          display: "inline-block",
                          fontSize: 10, fontWeight: 700, textTransform: "capitalize",
                          padding: "4px 10px", borderRadius: 6,
                          background: diff.bg, color: diff.color,
                          border: `1px solid ${diff.border}`,
                        }}>
                          {quiz.difficulty}
                        </div>
                        <button className="tc-btn">Continue Editing</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
