"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TeacherSidebar from "@/components/teacher/teacher-sidebar"
import TeacherMobileHeader from "@/components/teacher/teacher-mobile-header"

// Bloom's Taxonomy levels for chart
const BLOOMS_DATA = [
  { level: "Remember", students: 95, color: "#7f9fff" },
  { level: "Understand", students: 88, color: "#5dade2" },
  { level: "Apply", students: 76, color: "#58d68d" },
  { level: "Analyze", students: 64, color: "#f8c471" },
  { level: "Evaluate", students: 52, color: "#eb984e" },
  { level: "Create", students: 41, color: "#f1948a" },
]

export default function TeacherAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isTeacher = sessionStorage.getItem("isTeacher")
    if (!isTeacher) {
      router.push("/teacher/login")
      return
    }
    setLoading(false)
  }, [router])

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
        .tc-analytics { font-family: 'DM Sans', sans-serif; }
        .tc-analytics * { box-sizing: border-box; }

        @keyframes tcBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .tc-blob { animation: tcBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        @keyframes tcBarGrow {
          from { width: 0%; }
        }
        .tc-bar { animation: tcBarGrow 1s ease forwards; }

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-fadeup { animation: tcFadeUp .35s ease forwards; }
        .tc-fadeup-1 { animation-delay: .05s; opacity: 0; }
        .tc-fadeup-2 { animation-delay: .15s; opacity: 0; }
        .tc-fadeup-3 { animation-delay: .25s; opacity: 0; }
      `}</style>

      <div className="tc-analytics" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>
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
                Analytics
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              {/* Prototype Banner */}
              <div style={{
                background: "linear-gradient(90deg, rgba(255,212,59,0.15), rgba(255,212,59,0.05))",
                border: "1px solid rgba(255,212,59,0.3)",
                borderRadius: 8,
                padding: "8px 14px",
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 16,
              }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{ fontSize: 12, color: "#FFD43B", fontWeight: 500 }}>
                  STATIC PROTOTYPE - This section demonstrates the Teacher Portal UI. Backend functionality is not connected.
                </span>
              </div>

              {/* Header */}
              <div className="tc-fadeup tc-fadeup-1" style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                  Analytics Dashboard
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                  Overview of quiz performance and student progress
                </p>
              </div>

              {/* Top Stats */}
              <div className="tc-fadeup tc-fadeup-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Total Quizzes", value: "12", color: "#58d68d", icon: "📝" },
                  { label: "Total Students", value: "48", color: "#7f9fff", icon: "👥" },
                  { label: "Quizzes Taken", value: "284", color: "#FFD43B", icon: "🎯" },
                  { label: "Avg. Score", value: "82%", color: "#51CF66", icon: "📊" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    padding: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: "'Syne', sans-serif" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Bloom's Taxonomy Performance */}
              <div className="tc-fadeup tc-fadeup-2" style={{
                padding: 24,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                marginBottom: 24,
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                  Bloom&apos;s Taxonomy Performance
                </h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>
                  Average student success rate by cognitive level
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {BLOOMS_DATA.map((item, i) => (
                    <div key={item.level}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.level}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{item.students}%</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
                        <div
                          className="tc-bar"
                          style={{
                            height: "100%",
                            width: `${item.students}%`,
                            background: item.color,
                            borderRadius: 100,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="tc-fadeup tc-fadeup-3" style={{
                padding: 24,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>
                  Recent Activity
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { action: "Maria Santos completed", quiz: "Biology Quiz", score: 92, time: "2 hours ago" },
                    { action: "Juan Dela Cruz completed", quiz: "History Quiz", score: 85, time: "3 hours ago" },
                    { action: "Sofia Cruz completed", quiz: "Math Quiz", score: 98, time: "5 hours ago" },
                    { action: "Pedro Reyes completed", quiz: "Biology Quiz", score: 76, time: "6 hours ago" },
                    { action: "Ana Garcia completed", quiz: "Chemistry Quiz", score: 88, time: "Yesterday" },
                  ].map((activity, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10,
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{activity.action} </span>
                        <span style={{ fontSize: 13, color: "#58d68d", fontWeight: 600 }}>{activity.quiz}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 700,
                          color: activity.score >= 80 ? "#51CF66" : activity.score >= 60 ? "#FFD43B" : "#FF6B6B",
                        }}>
                          {activity.score}%
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", minWidth: 80, textAlign: "right" }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
