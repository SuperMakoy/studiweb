"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { getQuizHistory } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
import { LogOut, Mail, User as UserIcon, BookOpen } from "lucide-react"

interface StudentStats {
  totalQuizzes: number
  totalPoints: number
  averageScore: number
  highestScore: number
}

export default function StudentProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<StudentStats>({
    totalQuizzes: 0,
    totalPoints: 0,
    averageScore: 0,
    highestScore: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    const loadStats = async () => {
      try {
        const history = await getQuizHistory()
        if (history.length > 0) {
          const totalQuizzes = history.length
          const totalPoints = history.reduce((sum, q) => sum + (q.points || 0), 0)
          const averageScore = Math.round(
            history.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / history.length
          )
          const highestScore = Math.max(...history.map((q) => (q.score / q.totalQuestions) * 100))

          setStats({
            totalQuizzes,
            totalPoints,
            averageScore,
            highestScore: Math.round(highestScore),
          })
        }
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    loadStats()
  }, [user, authLoading, router])

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/login")
    } catch (error) {
      setMessage("Error logging out")
      console.error("Logout error:", error)
    }
  }

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#07071a",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .sp-wrap { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .sp-btn { transition: all .2s; cursor: pointer; font-family: inherit; }
        .sp-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .sp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @keyframes spFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sp-fadein { animation: spFadeIn .3s ease forwards; }
      `}</style>

      <div
        className="sp-wrap"
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#07071a",
          color: "#fff",
        }}
      >
        <MobileHeaderNav />
        <Sidebar />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
          className="pt-14 md:pt-0"
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(7,7,26,0.85)",
              backdropFilter: "blur(12px)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                }}
              >
                Student Profile
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
                Your account and learning stats
              </p>
            </div>

            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button
                className="sp-btn"
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Back to Dashboard
              </button>
            </Link>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "24px 28px",
            }}
          >
            <div className="sp-fadein" style={{ maxWidth: 800 }}>
              {/* Profile Section */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "24px",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {user.email?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 20,
                        fontWeight: 800,
                        margin: 0,
                        marginBottom: 4,
                      }}
                    >
                      {user.displayName || "Student"}
                    </h2>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                      }}
                    >
                      <Mail size={16} style={{ color: "#5B6EE8" }} />
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>Email verified</span>
                      {user.emailVerified && (
                        <span
                          style={{
                            marginLeft: "auto",
                            padding: "2px 8px",
                            borderRadius: 100,
                            background: "rgba(81,207,102,0.15)",
                            color: "#51CF66",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                      }}
                    >
                      <UserIcon size={16} style={{ color: "#5B6EE8" }} />
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>Account created</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 12,
                        }}
                      >
                        {user.metadata?.creationTime
                          ? new Date(user.metadata.creationTime).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {[
                  { label: "Total Quizzes", value: stats.totalQuizzes, icon: "📝" },
                  { label: "Total Points", value: stats.totalPoints, icon: "⭐" },
                  { label: "Average Score", value: `${stats.averageScore}%`, icon: "📊" },
                  { label: "Highest Score", value: `${stats.highestScore}%`, icon: "🏆" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#5B6EE8",
                        marginBottom: 4,
                      }}
                    >
                      {loadingStats ? "..." : stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Settings Section */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "24px",
                  marginBottom: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 16,
                    fontWeight: 800,
                    margin: "0 0 16px",
                  }}
                >
                  Settings
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <Link href="/password-reset" style={{ textDecoration: "none" }}>
                    <button
                      className="sp-btn"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.7)",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <BookOpen size={16} />
                      Change Password
                    </button>
                  </Link>

                  <button
                    className="sp-btn"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#FF6B6B",
                      background: "rgba(255,107,107,0.1)",
                      border: "1px solid rgba(255,107,107,0.2)",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,107,107,0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,107,107,0.1)"
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "rgba(255,107,107,0.1)",
                    border: "1px solid rgba(255,107,107,0.2)",
                    color: "#FF6B6B",
                    fontSize: 12,
                  }}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
