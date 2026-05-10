"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TeacherSidebar from "@/components/teacher/teacher-sidebar"
import TeacherMobileHeader from "@/components/teacher/teacher-mobile-header"

// Static mock data for prototype
const MOCK_QUIZZES = [
  { id: "1", title: "Introduction to Biology", questions: 15, difficulty: "easy", status: "published", date: "2025-01-08", students: 24 },
  { id: "2", title: "World History Chapter 5", questions: 20, difficulty: "moderate", status: "published", date: "2025-01-07", students: 18 },
  { id: "3", title: "Mathematics Fundamentals", questions: 25, difficulty: "hard", status: "published", date: "2025-01-06", students: 31 },
  { id: "4", title: "English Literature Review", questions: 12, difficulty: "easy", status: "draft", date: "2025-01-05", students: 0 },
  { id: "5", title: "Chemistry Basics", questions: 18, difficulty: "moderate", status: "published", date: "2025-01-04", students: 22 },
  { id: "6", title: "Physics Motion Laws", questions: 20, difficulty: "hard", status: "draft", date: "2025-01-03", students: 0 },
  { id: "7", title: "Geography Continents", questions: 10, difficulty: "easy", status: "published", date: "2025-01-02", students: 15 },
  { id: "8", title: "Computer Science Intro", questions: 15, difficulty: "moderate", status: "published", date: "2025-01-01", students: 28 },
  { id: "9", title: "Art History Renaissance", questions: 12, difficulty: "moderate", status: "draft", date: "2024-12-30", students: 0 },
  { id: "10", title: "Music Theory Basics", questions: 8, difficulty: "easy", status: "published", date: "2024-12-28", students: 12 },
  { id: "11", title: "Economics 101", questions: 22, difficulty: "hard", status: "published", date: "2024-12-25", students: 19 },
  { id: "12", title: "Psychology Concepts", questions: 16, difficulty: "moderate", status: "draft", date: "2024-12-20", students: 0 },
]

const DIFF_CONFIG = {
  easy: { color: "#51CF66", bg: "rgba(81,207,102,0.15)", border: "rgba(81,207,102,0.3)" },
  moderate: { color: "#FFD43B", bg: "rgba(255,212,59,0.15)", border: "rgba(255,212,59,0.3)" },
  hard: { color: "#FF6B6B", bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.3)" },
}

type FilterTab = "all" | "published" | "draft"

export default function TeacherQuizzesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const isTeacher = sessionStorage.getItem("isTeacher")
    if (!isTeacher) {
      router.push("/teacher/login")
      return
    }
    setLoading(false)
  }, [router])

  const filteredQuizzes = MOCK_QUIZZES.filter(q => {
    const matchesFilter = filter === "all" ? true : q.status === filter
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: MOCK_QUIZZES.length,
    published: MOCK_QUIZZES.filter(q => q.status === "published").length,
    drafts: MOCK_QUIZZES.filter(q => q.status === "draft").length,
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
        .tc-quizzes { font-family: 'DM Sans', sans-serif; }
        .tc-quizzes * { box-sizing: border-box; }

        @keyframes tcBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .tc-blob { animation: tcBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        .tc-tb-btn {
          padding: 5px 10px; border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.5);
          cursor: pointer; transition: all .15s;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500;
        }
        .tc-tb-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
        .tc-tb-btn.active { background: rgba(88,214,141,0.2); border-color: rgba(88,214,141,0.4); color: #7dcea0; }

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

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-grid-item { animation: tcFadeUp .3s ease forwards; opacity: 0; }
        .tc-grid-item:nth-child(1) { animation-delay: .04s; }
        .tc-grid-item:nth-child(2) { animation-delay: .08s; }
        .tc-grid-item:nth-child(3) { animation-delay: .12s; }
        .tc-grid-item:nth-child(4) { animation-delay: .16s; }
        .tc-grid-item:nth-child(5) { animation-delay: .20s; }
        .tc-grid-item:nth-child(6) { animation-delay: .24s; }
        .tc-grid-item:nth-child(n+7) { animation-delay: .28s; }
      `}</style>

      <div className="tc-quizzes" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>
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
                {filter === "all" ? "All Quizzes" : filter === "published" ? "Published" : "Drafts"}
              </span>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["all", "published", "draft"] as FilterTab[]).map((f) => (
                <button
                  key={f}
                  className={`tc-tb-btn${filter === f ? " active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? `All (${stats.total})` : f === "published" ? `Published (${stats.published})` : `Drafts (${stats.drafts})`}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.35 }}>
                <circle cx="5.5" cy="5.5" r="4" stroke="#fff" strokeWidth="1.2" />
                <path d="M9 9l2.5 2.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                suppressHydrationWarning
                className="tc-search"
                placeholder="Search quizzes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Create button */}
            <button
              className="tc-tb-btn"
              onClick={() => router.push("/teacher/dashboard")}
              style={{ background: "rgba(88,214,141,0.15)", borderColor: "rgba(88,214,141,0.3)", color: "#7dcea0" }}
            >
              <span style={{ marginRight: 4 }}>+</span> Create Quiz
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {filteredQuizzes.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
                <div style={{ fontSize: 40, opacity: 0.3 }}>📝</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
                  {search ? `No quizzes matching "${search}"` : "No quizzes yet"}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {filteredQuizzes.map((quiz, i) => {
                  const diff = DIFF_CONFIG[quiz.difficulty as keyof typeof DIFF_CONFIG]
                  return (
                    <div
                      key={quiz.id}
                      className="tc-quiz-card tc-grid-item"
                      onClick={() => {}}
                    >
                      {/* Header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {quiz.title}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                            {quiz.date}
                          </div>
                        </div>
                        <div style={{
                          fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                          padding: "3px 8px", borderRadius: 100,
                          background: quiz.status === "published" ? "rgba(81,207,102,0.15)" : "rgba(255,212,59,0.15)",
                          color: quiz.status === "published" ? "#51CF66" : "#FFD43B",
                          border: `1px solid ${quiz.status === "published" ? "rgba(81,207,102,0.3)" : "rgba(255,212,59,0.3)"}`,
                        }}>
                          {quiz.status}
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#58d68d" }}>{quiz.questions}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Questions</div>
                        </div>
                        {quiz.status === "published" && (
                          <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#7f9fff" }}>{quiz.students}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Students</div>
                          </div>
                        )}
                      </div>

                      {/* Difficulty badge */}
                      <div style={{
                        display: "inline-block",
                        fontSize: 10, fontWeight: 700, textTransform: "capitalize",
                        padding: "4px 10px", borderRadius: 6,
                        background: diff.bg, color: diff.color,
                        border: `1px solid ${diff.border}`,
                      }}>
                        {quiz.difficulty}
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
