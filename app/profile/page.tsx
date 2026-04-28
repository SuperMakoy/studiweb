"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getAllQuizHistory, getUserFiles, type QuizHistory } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"

export default function StudentProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalName, setOriginalName] = useState("")
  const [stats, setStats] = useState({ totalQuizzes: 0, totalPoints: 0, avgScore: 0, totalFiles: 0 })
  const [loadingStats, setLoadingStats] = useState(true)
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    setDisplayName(user.displayName || "")
    setEmail(user.email || "")
    setOriginalName(user.displayName || "")

    // Load stats
    const loadStats = async () => {
      try {
        const [quizzes, files] = await Promise.all([
          getAllQuizHistory(),
          getUserFiles(),
        ])
        
        setQuizHistory(quizzes)
        
        const totalPoints = quizzes.reduce((sum, q) => sum + (q.points || 0), 0)
        const avgScore = quizzes.length > 0
          ? Math.round(quizzes.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / quizzes.length)
          : 0
        
        setStats({
          totalQuizzes: quizzes.length,
          totalPoints,
          avgScore,
          totalFiles: files.length,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    loadStats()
  }, [user, authLoading, router])

  const handleNameChange = (v: string) => {
    setDisplayName(v)
    setHasChanges(v !== originalName)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!displayName.trim() || !auth.currentUser) return
    setSaving(true)
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      })
      setOriginalName(displayName.trim())
      setHasChanges(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2800)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const initials = (displayName || email || "U")
    .split(/[\s@]/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Calculate level based on points
  const level = Math.floor(stats.totalPoints / 500) + 1
  const pointsInLevel = stats.totalPoints % 500
  const progressToNextLevel = (pointsInLevel / 500) * 100

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .sp * { box-sizing: border-box; }
        .sp { font-family: 'DM Sans', sans-serif; }

        @keyframes spBlob { 0%,100%{transform:scale(1)}50%{transform:scale(1.07)} }
        .sp-blob { animation: spBlob ease-in-out infinite; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        @keyframes spFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sp-fadeup { animation: spFadeUp .35s ease forwards; }
        .sp-fadeup-1 { animation-delay: .05s; opacity: 0; }
        .sp-fadeup-2 { animation-delay: .12s; opacity: 0; }
        .sp-fadeup-3 { animation-delay: .20s; opacity: 0; }

        .sp-inp {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all .2s;
        }
        .sp-inp:focus {
          border-color: #5B6EE8;
          background: rgba(91,110,232,0.08);
          box-shadow: 0 0 0 3px rgba(91,110,232,0.15);
        }
        .sp-inp::placeholder { color: rgba(255,255,255,0.22); }
        .sp-inp:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255,255,255,0.03);
        }

        .sp-save-btn {
          padding: 11px 24px;
          border-radius: 10px;
          border: none;
          font-size: 14px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all .2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sp-save-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .sp-save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .sp-stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 16px 20px;
          transition: border-color .2s, transform .2s;
        }
        .sp-stat-card:hover { border-color: rgba(91,110,232,0.25); transform: translateY(-1px); }

        @keyframes spXp { from { width: 0; } }
        .sp-xp-fill { animation: spXp .9s ease-out .4s both; }

        @keyframes spSpin { to { transform: rotate(360deg); } }
        .sp-spin { animation: spSpin .8s linear infinite; }
      `}</style>

      <div
        className="sp"
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: "#07071a",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Ambient blobs */}
        <div className="sp-blob" style={{ width: 320, height: 320, background: "rgba(91,110,232,0.09)", top: -60, left: 200, animationDuration: "11s" }} />
        <div className="sp-blob" style={{ width: 220, height: 220, background: "rgba(123,94,167,0.07)", bottom: 40, right: 60, animationDuration: "15s", animationDelay: "5s" }} />

        <MobileHeaderNav />
        <Sidebar />

        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}
          className="pt-14 md:pt-0"
        >
          {/* Top bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,7,26,0.9)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                <span>Dashboard</span>
                <span>›</span>
                <span style={{ color: "#9baeff", fontWeight: 600 }}>Profile</span>
              </div>
            </div>

            {/* Unsaved indicator */}
            {hasChanges && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 11, fontWeight: 600,
                color: "#FFD43B",
                background: "rgba(255,212,59,0.08)",
                border: "1px solid rgba(255,212,59,0.2)",
                borderRadius: 100, padding: "4px 12px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD43B" }} />
                Unsaved changes
              </div>
            )}
          </div>

          {/* Main content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>

              {/* Profile hero */}
              <div
                className="sp-fadeup sp-fadeup-1"
                style={{
                  background: "linear-gradient(135deg, rgba(91,110,232,0.18) 0%, rgba(91,110,232,0.06) 100%)",
                  border: "1px solid rgba(91,110,232,0.22)",
                  borderRadius: 20,
                  padding: "28px 28px 24px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  flexWrap: "wrap",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative corner glow */}
                <div style={{
                  position: "absolute", top: -40, right: -40,
                  width: 120, height: 120, borderRadius: "50%",
                  background: "rgba(91,110,232,0.15)", filter: "blur(30px)",
                  pointerEvents: "none",
                }} />

                {/* Avatar */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff",
                  flexShrink: 0,
                  boxShadow: "0 0 0 4px rgba(91,110,232,0.25)",
                }}>
                  {initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                    color: "#FFD43B", background: "rgba(255,212,59,0.15)",
                    border: "1px solid rgba(255,212,59,0.25)", borderRadius: 100,
                    padding: "3px 10px", marginBottom: 8,
                  }}>
                    Level {level} Learner
                  </div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: -0.5 }}>
                    {displayName || email?.split("@")[0] || "Student"}
                  </h1>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>{email}</p>
                </div>

                {/* Level progress */}
                <div style={{ flexShrink: 0, textAlign: "center", minWidth: 100 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#FFD43B", lineHeight: 1 }}>
                    {loadingStats ? "—" : stats.totalPoints.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>total points</div>
                  <div style={{ marginTop: 8, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 100, overflow: "hidden", width: 100 }}>
                    <div
                      className="sp-xp-fill"
                      style={{
                        height: "100%",
                        width: `${progressToNextLevel}%`,
                        background: "linear-gradient(90deg, #FFD43B, #eb984e)",
                        borderRadius: 100,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                    {500 - pointsInLevel} pts to level {level + 1}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div
                className="sp-fadeup sp-fadeup-1"
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}
              >
                {[
                  { label: "Quizzes", value: stats.totalQuizzes, icon: "📝", color: "#9baeff" },
                  { label: "Avg Score", value: `${stats.avgScore}%`, icon: "📊", color: stats.avgScore >= 75 ? "#51CF66" : stats.avgScore >= 60 ? "#FFD43B" : "#FF6B6B" },
                  { label: "Points", value: stats.totalPoints.toLocaleString(), icon: "⭐", color: "#FFD43B" },
                  { label: "Files", value: stats.totalFiles, icon: "📁", color: "#5dade2" },
                ].map((s) => (
                  <div key={s.label} className="sp-stat-card">
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: loadingStats ? "rgba(255,255,255,0.2)" : s.color, lineHeight: 1 }}>
                      {loadingStats ? "—" : s.value}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Edit form */}
              <div
                className="sp-fadeup sp-fadeup-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18,
                  padding: "24px",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)", margin: "0 0 20px" }}>
                  Profile Information
                </h2>

                {/* Display Name */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 700,
                    color: "rgba(255,255,255,0.4)", letterSpacing: "0.9px",
                    textTransform: "uppercase", marginBottom: 7,
                  }}>
                    Display Name
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={displayName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name"
                    className="sp-inp"
                  />
                </div>

                {/* Email — read-only */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 700,
                    color: "rgba(255,255,255,0.4)", letterSpacing: "0.9px",
                    textTransform: "uppercase", marginBottom: 7,
                  }}>
                    Email Address
                  </label>
                  <div style={{
                    padding: "11px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{email}</span>
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 700,
                      color: "rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.05)", borderRadius: 100,
                      padding: "2px 8px", letterSpacing: "0.5px", textTransform: "uppercase",
                    }}>read-only</span>
                  </div>
                </div>

                {/* Save button */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    suppressHydrationWarning
                    className="sp-save-btn"
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    style={{
                      background: saved
                        ? "rgba(81,207,102,0.15)"
                        : hasChanges
                        ? "linear-gradient(135deg,#5B6EE8,#7b5ea7)"
                        : "rgba(255,255,255,0.07)",
                      border: saved
                        ? "1px solid rgba(81,207,102,0.35)"
                        : hasChanges
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                      color: saved ? "#51CF66" : hasChanges ? "#fff" : "rgba(255,255,255,0.3)",
                      boxShadow: hasChanges && !saved ? "0 4px 14px rgba(91,110,232,0.3)" : "none",
                    }}
                  >
                    {saving ? (
                      <>
                        <svg className="sp-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                          <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M4.5 7l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Saved!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M4.5 2v3h5V2M4.5 8h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>

                  {saved && (
                    <span style={{ fontSize: 12, color: "rgba(81,207,102,0.7)" }}>
                      Your profile has been updated.
                    </span>
                  )}
                </div>
              </div>

              {/* Account info */}
              <div
                className="sp-fadeup sp-fadeup-3"
                style={{
                  background: "rgba(91,110,232,0.05)",
                  border: "1px solid rgba(91,110,232,0.15)",
                  borderRadius: 16,
                  padding: "18px 22px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(91,110,232,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  ℹ️
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
                    About Your Account
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: 0 }}>
                    Your progress, quiz history, and study files are all saved to your account. 
                    Keep learning to earn more points and level up! Your stats reset daily for the Bloom&apos;s Taxonomy breakdown, 
                    but your overall progress is always preserved.
                  </p>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  )
}
