"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { getAllQuizHistory, type QuizHistory } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
import QuizHistoryCard from "@/components/quiz/quiz-history-card"

export default function QuizHistoryPage() {
  const { user, loading } = useAuth()
  const [quizzes, setQuizzes] = useState<QuizHistory[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all")

  useEffect(() => {
    if (loading || !user) return
    
    const loadQuizzes = async () => {
      try {
        const history = await getAllQuizHistory()
        setQuizzes(history)
      } catch (error) {
        console.error("Error loading quiz history:", error)
        setQuizzes([])
      } finally {
        setDataLoading(false)
      }
    }
    
    loadQuizzes()
  }, [user, loading])

  // Filter quizzes based on selected time range
  const getFilteredQuizzes = () => {
    if (filter === "all") return quizzes
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return quizzes.filter(quiz => {
      const quizDate = new Date(quiz.completedAt)
      
      if (filter === "today") {
        const quizDay = new Date(quizDate.getFullYear(), quizDate.getMonth(), quizDate.getDate())
        return quizDay.getTime() === today.getTime()
      }
      
      if (filter === "week") {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return quizDate >= weekAgo
      }
      
      if (filter === "month") {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        return quizDate >= monthAgo
      }
      
      return true
    })
  }

  // Group quizzes by date
  const groupQuizzesByDate = (quizzes: QuizHistory[]) => {
    const groups: Record<string, QuizHistory[]> = {}
    
    quizzes.forEach(quiz => {
      const dateKey = new Date(quiz.completedAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(quiz)
    })
    
    return groups
  }

  const filteredQuizzes = getFilteredQuizzes()
  const groupedQuizzes = groupQuizzesByDate(filteredQuizzes)

  // Calculate stats
  const totalQuizzes = filteredQuizzes.length
  const avgScore = totalQuizzes > 0
    ? Math.round(filteredQuizzes.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / totalQuizzes)
    : 0
  const totalPoints = filteredQuizzes.reduce((sum, q) => sum + (q.points || 0), 0)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .qh-page * { box-sizing: border-box; margin: 0; padding: 0; }
        .qh-page { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        @keyframes blobPulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.08)} }
        .qh-blob { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; animation:blobPulse ease-in-out infinite; }

        .qh-filter-btn {
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-family: inherit;
        }
        .qh-filter-btn:hover {
          border-color: rgba(91,110,232,0.3);
          color: rgba(255,255,255,0.7);
        }
        .qh-filter-btn.active {
          background: rgba(91,110,232,0.2);
          border-color: rgba(91,110,232,0.4);
          color: #9baeff;
        }
      `}</style>

      <div className="qh-page" style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#07071a", color:"#fff", position:"relative" }}>
        <div className="qh-blob" style={{ width:360, height:360, background:"rgba(91,110,232,0.1)", top:-60, left:220, animationDuration:"9s" }} />
        <div className="qh-blob" style={{ width:280, height:280, background:"rgba(123,94,167,0.08)", bottom:60, right:60, animationDuration:"13s", animationDelay:"4s" }} />

        <MobileHeaderNav />
        <Sidebar />

        <main style={{ flex:1, overflow:"auto", position:"relative", zIndex:1, display:"flex", flexDirection:"column" }} className="pt-14 md:pt-0">

          {/* Top bar */}
          <div style={{ 
            display:"flex", alignItems:"center", justifyContent:"space-between", 
            padding:"18px 28px", borderBottom:"1px solid rgba(255,255,255,0.05)", 
            background:"rgba(7,7,26,0.85)", backdropFilter:"blur(12px)", 
            position:"sticky", top:0, zIndex:10,
            flexWrap: "wrap", gap: 16
          }}>
            <div>
              <Link href="/dashboard" style={{ textDecoration:"none", color:"#7f9fff", fontSize:12, display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M7.5 9L4.5 6l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 style={{ fontFamily:"'Syne', sans-serif", fontSize:22, fontWeight:800, color:"#fff", margin:0 }}>
                Quiz History
              </h1>
            </div>

            {/* Filter buttons */}
            <div style={{ display:"flex", gap:8 }}>
              {(["all", "today", "week", "month"] as const).map((f) => (
                <button
                  key={f}
                  className={`qh-filter-btn${filter === f ? " active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All Time" : f === "today" ? "Today" : f === "week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>
          </div>

          {/* Stats banner */}
          <div style={{ 
            display:"flex", alignItems:"center", gap:16, 
            padding:"16px 28px", 
            background:"rgba(91,110,232,0.08)", 
            borderBottom:"1px solid rgba(91,110,232,0.15)",
            flexWrap:"wrap"
          }}>
            {[
              { label: "Total Quizzes", value: totalQuizzes.toString(), color: "#7f9fff" },
              { label: "Avg Score", value: `${avgScore}%`, color: avgScore >= 75 ? "#51CF66" : avgScore >= 60 ? "#FFD43B" : "#FF6B6B" },
              { label: "Total Points", value: totalPoints.toLocaleString(), color: "#FFD43B" },
            ].map((stat) => (
              <div key={stat.label} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontFamily:"'Syne', sans-serif", fontSize:24, fontWeight:800, color:stat.color }}>{stat.value}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.5px" }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Main content */}
          {(loading || dataLoading) ? (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.3)", fontSize:14 }}>
              Loading quiz history...
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
              <h2 style={{ fontFamily:"'Syne', sans-serif", fontSize:20, fontWeight:700, color:"#fff", marginBottom:8 }}>
                No quizzes found
              </h2>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", marginBottom:24 }}>
                {filter === "all" ? "Take your first quiz to see your history here." : "No quizzes in this time period."}
              </p>
              <Link href="/file-library" style={{ textDecoration:"none" }}>
                <button style={{
                  padding:"12px 24px", borderRadius:12,
                  background:"linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                  border:"none", color:"#fff", fontSize:14, fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit",
                  boxShadow:"0 6px 20px rgba(91,110,232,0.4)",
                }}>
                  Start a Quiz
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ padding:"24px 28px", flex:1 }}>
              {Object.entries(groupedQuizzes).map(([date, dateQuizzes]) => (
                <div key={date} style={{ marginBottom:32 }}>
                  <div style={{ 
                    fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.4)", 
                    textTransform:"uppercase", letterSpacing:"1px", 
                    marginBottom:16,
                    display:"flex", alignItems:"center", gap:10
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" opacity="0.5">
                      <rect x="1" y="2" width="12" height="11" rx="2" stroke="#fff" strokeWidth="1.2" />
                      <path d="M4 1v2M10 1v2M1 6h12" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {date}
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>({dateQuizzes.length} quiz{dateQuizzes.length !== 1 ? "zes" : ""})</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:14 }}>
                    {dateQuizzes.map((quiz) => (
                      <QuizHistoryCard key={quiz.id} quiz={quiz} showFileName={true} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
