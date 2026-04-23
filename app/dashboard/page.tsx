"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { getUserFiles, getQuizHistory } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"

// ─── Floating decorative items ───────────────────────────────────────────────
const FLOATERS = [
  { emoji: "🎯", style: { left: "8%",  top: "70%", animationDuration: "12s", animationDelay: "0s",   fontSize: 32 } },
  { emoji: "📚", style: { left: "22%", top: "80%", animationDuration: "15s", animationDelay: "3s",   fontSize: 24 } },
  { emoji: "⭐", style: { left: "38%", top: "85%", animationDuration: "10s", animationDelay: "1.5s", fontSize: 20 } },
  { emoji: "🎮", style: { left: "55%", top: "75%", animationDuration: "18s", animationDelay: "5s",   fontSize: 28 } },
  { emoji: "🏆", style: { left: "70%", top: "82%", animationDuration: "13s", animationDelay: "2s",   fontSize: 22 } },
  { emoji: "💡", style: { left: "85%", top: "78%", animationDuration: "16s", animationDelay: "4s",   fontSize: 30 } },
  { emoji: "🎲", style: { left: "15%", top: "60%", animationDuration: "20s", animationDelay: "7s",   fontSize: 18 } },
  { emoji: "📝", style: { left: "78%", top: "65%", animationDuration: "11s", animationDelay: "6s",   fontSize: 26 } },
]

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        </svg>
      ),
    },
    {
      label: "File Library",
      href: "/file-library",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 8h6M5 5.5h6M5 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Study with AI",
      href: "/study-ai",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 6.5c0-1.1.9-2 2-2s2 .9 2 2c0 1.5-2 2.5-2 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11.5" r=".75" fill="currentColor" />
        </svg>
      ),
    },
  ]

  const handleLogout = async () => {
    await auth.signOut()
    router.push("/")
  }

  return (
    <aside style={{
      width: 200,
      background: "#0d0d2b",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 16px", fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
        STU<span style={{ color: "#7f9fff", fontStyle: "normal" }}>DI</span>
      </div>

      {/* Nav section label */}
      <div style={{ padding: "8px 20px 4px", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>
        Menu
      </div>

      {/* Nav items */}
      <nav style={{ padding: "0 8px" }}>
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: active ? "#9baeff" : "rgba(255,255,255,0.45)",
                background: active ? "rgba(91,110,232,0.18)" : "transparent",
                border: active ? "1px solid rgba(91,110,232,0.25)" : "1px solid transparent",
                textDecoration: "none",
                marginBottom: 2,
                transition: "all .2s",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Level progress */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, marginBottom: 8 }}>
          Progress
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Overall Level</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#7f9fff" }}>Lv. 12</div>
          <div style={{ marginTop: 8, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ width: "68%", height: "100%", background: "linear-gradient(90deg,#5B6EE8,#9b7fe8)", borderRadius: 100 }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>680 / 1000 XP</div>
        </div>
      </div>

      {/* Bottom: user + logout */}
      <div style={{ marginTop: "auto", padding: "16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#51CF66,#37b24d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0 }}>
            M
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Makoy</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Scholar</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ marginTop: 8, width: "100%", padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "rgba(255,107,107,0.8)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s", fontFamily: "inherit" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  )
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ diff }: { diff: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    easy:     { bg: "rgba(81,207,102,0.12)",  color: "#51CF66", border: "rgba(81,207,102,0.2)"  },
    moderate: { bg: "rgba(255,212,59,0.12)",  color: "#FFD43B", border: "rgba(255,212,59,0.2)"  },
    hard:     { bg: "rgba(255,107,107,0.12)", color: "#FF6B6B", border: "rgba(255,107,107,0.2)" },
  }
  const s = map[diff] ?? map.moderate
  return (
    <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 100, marginTop: 6, background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: "uppercase", letterSpacing: ".5px" }}>
      {diff}
    </span>
  )
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }))
  }, [])

  useEffect(() => {
    if (loading || !user) return
    getUserFiles().then((f) => setFiles(f.slice(0, 3))).catch(() => {})
    getQuizHistory().then((q) => setQuizzes(q.slice(0, 4))).catch(() => {})
  }, [user, loading])

  const taxonomyLevels = [
    { name: "Remember",   pct: 88, color: "#7f9fff" },
    { name: "Understand", pct: 75, color: "#5dade2" },
    { name: "Apply",      pct: 68, color: "#58d68d" },
    { name: "Analyze",    pct: 52, color: "#f8c471" },
    { name: "Evaluate",   pct: 40, color: "#eb984e" },
    { name: "Create",     pct: 28, color: "#f1948a" },
  ]

  const quickActions = [
    { emoji: "🎮", label: "Start a Quiz",      sub: "Pick a file and go",    href: "/file-library" },
    { emoji: "📤", label: "Upload New File",   sub: "TXT, DOC supported",    href: "/file-library" },
    { emoji: "🤖", label: "Study with AI",     sub: "Chat with your notes",  href: "/study-ai" },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        .studi-db * { box-sizing: border-box; margin: 0; padding: 0; }
        .studi-db { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.04; }
          50%  { opacity: 0.08; }
          100% { transform: translateY(-110px) rotate(18deg); opacity: 0.03; }
        }
        .studi-floater {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          animation: floatUp linear infinite;
          user-select: none;
        }

        @keyframes blobPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        .studi-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          animation: blobPulse ease-in-out infinite;
        }

        @keyframes xpGrow { from { width: 0; } }
        .studi-xpfill { animation: xpGrow 1.6s ease-out; }

        .studi-navitem:hover { background: rgba(255,255,255,0.05) !important; color: rgba(255,255,255,0.85) !important; }
        .studi-file-card:hover { border-color: rgba(91,110,232,0.4) !important; transform: translateY(-2px); }
        .studi-qh-card:hover   { border-color: rgba(91,110,232,0.3) !important; background: rgba(91,110,232,0.07) !important; }
        .studi-qa:hover        { background: rgba(91,110,232,0.1) !important; border-color: rgba(91,110,232,0.25) !important; }
      `}</style>

      <div className="studi-db" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#07071a", color: "#fff", position: "relative" }}>

        {/* Floating decorative game items */}
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className="studi-floater"
            style={{
              left: f.style.left,
              top: f.style.top,
              fontSize: f.style.fontSize,
              animationDuration: f.style.animationDuration,
              animationDelay: f.style.animationDelay,
            }}
          >
            {f.emoji}
          </span>
        ))}

        {/* Ambient blobs */}
        <div className="studi-blob" style={{ width: 360, height: 360, background: "rgba(91,110,232,0.1)",  top: -60,  left: 220, animationDuration: "9s"  }} />
        <div className="studi-blob" style={{ width: 280, height: 280, background: "rgba(123,94,167,0.08)", bottom: 60, right: 60, animationDuration: "13s", animationDelay: "4s" }} />

        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main style={{ flex: 1, overflow: "auto", position: "relative", zIndex: 1 }}>

          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(7,7,26,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 100, padding: "8px 16px", minWidth: 240 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: .4 }}>
                <circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.3" />
                <path d="M9.5 9.5l2.5 2.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input placeholder="Search file to quiz..." style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "inherit", width: "100%" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Bell */}
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5C4.5 1.5 3 3.5 3 5.5v2L1.5 9H12.5L11 7.5V5.5C11 3.5 9.5 1.5 7 1.5z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                  <path d="M5.5 9v.5C5.5 10.3 6.2 11 7 11s1.5-.7 1.5-1.5V9" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                </svg>
                <div style={{ width: 7, height: 7, background: "#FF6B6B", borderRadius: "50%", position: "absolute", top: 7, right: 7, border: "1.5px solid #07071a" }} />
              </div>
              {/* Avatar */}
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#51CF66,#37b24d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff", cursor: "pointer" }}>
                M
              </div>
            </div>
          </div>

          {/* Page content */}
          <div style={{ padding: "24px 28px" }}>

            {/* ── Welcome banner ── */}
            <div style={{ background: "linear-gradient(135deg,rgba(91,110,232,0.22) 0%,rgba(91,110,232,0.08) 100%)", border: "1px solid rgba(91,110,232,0.28)", borderRadius: 20, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, position: "relative", overflow: "hidden" }}>
              {/* Streak badge */}
              <div style={{ position: "absolute", top: 14, right: 18, fontSize: 10, fontWeight: 700, color: "#5B6EE8", background: "rgba(91,110,232,0.15)", border: "1px solid rgba(91,110,232,0.3)", borderRadius: 100, padding: "4px 12px", letterSpacing: ".5px" }}>
                ⚡ Streak: 5 days
              </div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".8px" }}>{currentDate}</div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Welcome back, Makoy!</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>You&apos;re on a roll — keep that streak alive today.</p>
                {/* XP bar */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                    <span>Level 12 Progress</span><span>680 / 1000 XP</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 100, overflow: "hidden", width: 280 }}>
                    <div className="studi-xpfill" style={{ height: "100%", width: "68%", background: "linear-gradient(90deg,#5B6EE8,#9b7fe8)", borderRadius: 100 }} />
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                {[{ num: "28", lbl: "Quizzes" }, { num: "84%", lbl: "Avg Score" }, { num: "5🔥", lbl: "Streak" }].map((s) => (
                  <div key={s.lbl} style={{ textAlign: "center", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 18px" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#7f9fff" }}>{s.num}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".8px", marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Recently opened files ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>Recently Opened Files</div>
              <Link href="/file-library" style={{ fontSize: 12, color: "#7f9fff", textDecoration: "none", opacity: .8 }}>View all →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              {files.length > 0
                ? files.map((file) => (
                    <Link key={file.id} href={`/file-library/${file.id}`} style={{ textDecoration: "none" }}>
                      <div className="studi-file-card" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, cursor: "pointer", transition: "all .2s", position: "relative" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#FFD43B,#FFA94D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>📁</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.displayName || file.fileName}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{(file.fileSize / 1024).toFixed(1)} KB</div>
                      </div>
                    </Link>
                  ))
                : /* Skeleton placeholders */
                  ["Biology Reviewer Ch.4", "Math Formula Sheet", "History Notes - WW2"].map((name, i) => (
                    <div key={i} className="studi-file-card" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, cursor: "pointer", transition: "all .2s" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#FFD43B,#FFA94D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>📁</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Upload a file to see it here</div>
                    </div>
                  ))
              }
            </div>

            {/* ── Quiz game history ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>Quiz Game History</div>
              <Link href="/dashboard" style={{ fontSize: 12, color: "#7f9fff", textDecoration: "none", opacity: .8 }}>View all →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
              {quizzes.length > 0
                ? quizzes.map((q) => {
                    const pct = Math.round((q.score / q.totalQuestions) * 100)
                    const iconBg: Record<string, string> = { easy: "rgba(81,207,102,0.12)", moderate: "rgba(255,212,59,0.12)", hard: "rgba(255,107,107,0.12)" }
                    const icons: Record<string, string> = { easy: "🏆", moderate: "⚡", hard: "🔥" }
                    return (
                      <div key={q.id} className="studi-qh-card" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, cursor: "pointer", transition: "all .2s" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg[q.difficulty] ?? iconBg.moderate, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>
                          {icons[q.difficulty] ?? "🎯"}
                        </div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{q.score}/{q.totalQuestions}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{pct}% · {q.points ?? 0} pts</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.displayName || q.fileName}</div>
                        <DiffBadge diff={q.difficulty} />
                      </div>
                    )
                  })
                : /* Placeholder cards */
                  [
                    { score: "9/10", pct: "90% · 1,240 pts", name: "Biology Reviewer",   diff: "easy",     icon: "🏆", iconBg: "rgba(81,207,102,0.12)"  },
                    { score: "7/10", pct: "70% · 875 pts",   name: "Math Formula Sheet", diff: "moderate", icon: "⚡", iconBg: "rgba(255,212,59,0.12)"  },
                    { score: "6/10", pct: "60% · 540 pts",   name: "History Notes WW2",  diff: "hard",     icon: "🔥", iconBg: "rgba(255,107,107,0.12)" },
                    { score: "8/10", pct: "80% · 960 pts",   name: "Physics Ch. 3",      diff: "moderate", icon: "🎯", iconBg: "rgba(91,110,232,0.12)"  },
                  ].map((c, i) => (
                    <div key={i} className="studi-qh-card" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, cursor: "pointer", transition: "all .2s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{c.icon}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{c.score}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{c.pct}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                      <DiffBadge diff={c.diff} />
                    </div>
                  ))
              }
            </div>

            {/* ── Bottom row: Taxonomy + Quick Actions ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

              {/* Bloom's taxonomy performance */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 12V7l5-5 5 5v5H9V9H5v3H2z" stroke="#7f9fff" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                  Bloom&apos;s Taxonomy Performance
                </div>
                {taxonomyLevels.map((lv) => (
                  <div key={lv.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", width: 76, flexShrink: 0 }}>{lv.name}</div>
                    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ width: `${lv.pct}%`, height: "100%", background: lv.color, borderRadius: 100 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", width: 30, textAlign: "right" }}>{lv.pct}%</div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v3M7 9v3M2 7h3M9 7h3" stroke="#7f9fff" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  Quick Actions
                </div>
                {quickActions.map((qa) => (
                  <Link key={qa.label} href={qa.href} style={{ textDecoration: "none" }}>
                    <div className="studi-qa" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", marginBottom: 8, transition: "all .2s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(91,110,232,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{qa.emoji}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{qa.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{qa.sub}</div>
                      </div>
                      <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: 16 }}>›</div>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  )
}