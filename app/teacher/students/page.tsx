"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TeacherSidebar from "@/components/teacher/teacher-sidebar"
import TeacherMobileHeader from "@/components/teacher/teacher-mobile-header"

// Static mock data
const MOCK_STUDENTS = [
  { id: "1", name: "Juan Dela Cruz", email: "juan@studi.com", quizzesTaken: 8, avgScore: 85, lastActive: "2025-01-08" },
  { id: "2", name: "Maria Santos", email: "maria@studi.com", quizzesTaken: 12, avgScore: 92, lastActive: "2025-01-08" },
  { id: "3", name: "Pedro Reyes", email: "pedro@studi.com", quizzesTaken: 6, avgScore: 78, lastActive: "2025-01-07" },
  { id: "4", name: "Ana Garcia", email: "ana@studi.com", quizzesTaken: 10, avgScore: 88, lastActive: "2025-01-07" },
  { id: "5", name: "Carlos Mendoza", email: "carlos@studi.com", quizzesTaken: 5, avgScore: 72, lastActive: "2025-01-06" },
  { id: "6", name: "Sofia Cruz", email: "sofia@studi.com", quizzesTaken: 15, avgScore: 95, lastActive: "2025-01-08" },
  { id: "7", name: "Miguel Torres", email: "miguel@studi.com", quizzesTaken: 7, avgScore: 81, lastActive: "2025-01-05" },
  { id: "8", name: "Isabella Ramos", email: "isabella@studi.com", quizzesTaken: 9, avgScore: 87, lastActive: "2025-01-08" },
]

export default function TeacherStudentsPage() {
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

  const filteredStudents = MOCK_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
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
        .tc-students { font-family: 'DM Sans', sans-serif; }
        .tc-students * { box-sizing: border-box; }

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

        .tc-student-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: all .2s;
        }
        .tc-student-row:hover {
          background: rgba(88,214,141,0.05);
          border-color: rgba(88,214,141,0.2);
        }

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-row-item { animation: tcFadeUp .3s ease forwards; opacity: 0; }
        .tc-row-item:nth-child(1) { animation-delay: .04s; }
        .tc-row-item:nth-child(2) { animation-delay: .08s; }
        .tc-row-item:nth-child(3) { animation-delay: .12s; }
        .tc-row-item:nth-child(4) { animation-delay: .16s; }
        .tc-row-item:nth-child(n+5) { animation-delay: .20s; }
      `}</style>

      <div className="tc-students" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>
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
                Students
              </span>
            </div>

            <div style={{ position: "relative" }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.35 }}>
                <circle cx="5.5" cy="5.5" r="4" stroke="#fff" strokeWidth="1.2" />
                <path d="M9 9l2.5 2.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                suppressHydrationWarning
                className="tc-search"
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Students", value: MOCK_STUDENTS.length, color: "#58d68d" },
                { label: "Active Today", value: MOCK_STUDENTS.filter(s => s.lastActive === "2025-01-08").length, color: "#7f9fff" },
                { label: "Avg. Score", value: `${Math.round(MOCK_STUDENTS.reduce((sum, s) => sum + s.avgScore, 0) / MOCK_STUDENTS.length)}%`, color: "#FFD43B" },
              ].map(stat => (
                <div key={stat.label} style={{ padding: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, fontFamily: "'Syne', sans-serif" }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Students list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredStudents.map((student, i) => (
                <div key={student.id} className="tc-student-row tc-row-item">
                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg,#58d68d,#45b078)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>
                    {student.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{student.email}</div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#58d68d" }}>{student.quizzesTaken}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Quizzes</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: student.avgScore >= 80 ? "#51CF66" : student.avgScore >= 60 ? "#FFD43B" : "#FF6B6B" }}>
                        {student.avgScore}%
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Avg Score</div>
                    </div>
                  </div>

                  {/* Last active */}
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                    {student.lastActive}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
