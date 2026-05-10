"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TeacherSidebar from "@/components/teacher/teacher-sidebar"
import TeacherMobileHeader from "@/components/teacher/teacher-mobile-header"

export default function TeacherProfilePage() {
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
        .tc-profile { font-family: 'DM Sans', sans-serif; }
        .tc-profile * { box-sizing: border-box; }

        @keyframes tcBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .tc-blob { animation: tcBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        @keyframes tcFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-fadeup { animation: tcFadeUp .35s ease forwards; }
      `}</style>

      <div className="tc-profile" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>
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
                Profile
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            <div className="tc-fadeup" style={{ maxWidth: 600, margin: "0 auto" }}>

              {/* Profile Card */}
              <div style={{
                padding: 32,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                textAlign: "center",
                marginBottom: 24,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: "linear-gradient(135deg,#58d68d,#45b078)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 40, fontWeight: 800, color: "#fff",
                  margin: "0 auto 20px",
                  boxShadow: "0 8px 32px rgba(88,214,141,0.3)",
                }}>
                  T
                </div>

                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
                  Teacher Account
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>
                  teacher@studi.com
                </p>

                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(88,214,141,0.15)",
                  border: "1px solid rgba(88,214,141,0.3)",
                  borderRadius: 100,
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#7dcea0",
                }}>
                  Quiz Creator
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginBottom: 24,
              }}>
                {[
                  { label: "Quizzes Created", value: "12", color: "#58d68d" },
                  { label: "Total Students", value: "48", color: "#7f9fff" },
                  { label: "Avg. Score", value: "82%", color: "#FFD43B" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    padding: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, fontFamily: "'Syne', sans-serif" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Info section */}
              <div style={{
                padding: 24,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
              }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", textTransform: "uppercase", margin: "0 0 16px" }}>
                  Account Information
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Role", value: "Teacher" },
                    { label: "Department", value: "Education" },
                    { label: "Institution", value: "Central Mindanao University" },
                    { label: "Member Since", value: "January 2025" },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10,
                    }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div style={{
                marginTop: 24,
                padding: "14px 18px",
                background: "rgba(255,212,59,0.08)",
                border: "1px solid rgba(255,212,59,0.2)",
                borderRadius: 12,
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
              }}>
                <span style={{ color: "#FFD43B", fontWeight: 600 }}>Note:</span> This is a static prototype for HCI demonstration purposes. Profile editing is not available in this version.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
