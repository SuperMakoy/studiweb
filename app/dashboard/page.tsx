"use client"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUserFiles, getQuizHistory } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
import { BloomsFileSelector } from "@/components/dashboard/blooms-file-selector"

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ diff }: { diff: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    easy:     { bg: "rgba(81,207,102,0.12)",  color: "#51CF66", border: "rgba(81,207,102,0.2)"  },
    moderate: { bg: "rgba(255,212,59,0.12)",  color: "#FFD43B", border: "rgba(255,212,59,0.2)"  },
    hard:     { bg: "rgba(255,107,107,0.12)", color: "#FF6B6B", border: "rgba(255,107,107,0.2)" },
  }
  const s = map[diff] ?? map.moderate
  return (
    <span style={{
      display: "inline-block", fontSize: 9, fontWeight: 700,
      padding: "2px 7px", borderRadius: 100, marginTop: 6,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      textTransform: "uppercase", letterSpacing: ".5px",
    }}>
      {diff}
    </span>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ hasFiles }: { hasFiles: boolean }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", flex: 1, padding: "40px 24px",
      textAlign: "center",
    }}>
      {/* Step indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 48 }}>
        {[
          { num: 1, label: "Upload a file", done: hasFiles, active: !hasFiles },
          { num: 2, label: "Take a quiz", done: false, active: hasFiles },
        ].map((step, i) => (
          <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", margin: "0 auto 10px",
                background: step.done
                  ? "rgba(81,207,102,0.15)"
                  : step.active
                  ? "rgba(91,110,232,0.2)"
                  : "rgba(255,255,255,0.05)",
                border: step.done
                  ? "1.5px solid rgba(81,207,102,0.4)"
                  : step.active
                  ? "1.5px solid rgba(91,110,232,0.5)"
                  : "1.5px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16,
                color: step.done ? "#51CF66" : step.active ? "#9baeff" : "rgba(255,255,255,0.2)",
              }}>
                {step.done ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 8l3 3 5-5" stroke="#51CF66" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : step.num}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: step.active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
                {step.label}
              </div>
            </div>
            {i < 1 && (
              <div style={{
                width: 60, height: 1, margin: "0 12px",
                background: hasFiles ? "rgba(91,110,232,0.4)" : "rgba(255,255,255,0.08)",
                marginBottom: 22,
              }} />
            )}
          </div>
        ))}
      </div>

      {!hasFiles ? (
        <>
          <div style={{ fontSize: 42, marginBottom: 16 }}>📂</div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800,
            color: "#fff", margin: "0 0 10px", letterSpacing: -0.5,
          }}>
            Upload your first file
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 360, marginBottom: 28 }}>
            Add a TXT or Word document — your notes, reviewer, or any study material — and STUDI will generate a personalized quiz for you.
          </p>
          <Link href="/file-library" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "13px 32px", borderRadius: 12,
              background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
              border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 6px 20px rgba(91,110,232,0.4)",
            }}>
              📤 Go to File Library
            </button>
          </Link>
        </>
      ) : (
        <>
          <div style={{ fontSize: 42, marginBottom: 16 }}>🎮</div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800,
            color: "#fff", margin: "0 0 10px", letterSpacing: -0.5,
          }}>
            Ready to quiz yourself?
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 360, marginBottom: 28 }}>
            You&apos;ve got files ready to go. Pick one and start a quiz — your history and stats will show up right here after your first attempt.
          </p>
          <Link href="/file-library" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "13px 32px", borderRadius: 12,
              background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
              border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 6px 20px rgba(91,110,232,0.4)",
            }}>
              🎯 Pick a File to Quiz
            </button>
          </Link>
        </>
      )}
    </div>
  )
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [selectedBloomsFileName, setSelectedBloomsFileName] = useState<string | null>(null)
  const [bloomsData, setBloomsData] = useState<any>(null)

  const getGroupedQuizzesByFile = () => {
    const grouped: Record<string, any[]> = {}
    quizzes.forEach(quiz => {
      if (!grouped[quiz.fileName]) grouped[quiz.fileName] = []
      grouped[quiz.fileName].push(quiz)
    })
    return grouped
  }

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }))
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term.trim().length > 0) {
      const results = files.filter(f =>
        (f.displayName || f.fileName).toLowerCase().includes(term.toLowerCase())
      )
      setSearchResults(results)
      setShowSearchDropdown(true)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }

  const handleSelectFile = (fileId: string) => {
    setSearchTerm("")
    setShowSearchDropdown(false)
    setSearchResults([])
    router.push(`/file-library/${fileId}`)
  }

  const calculateBloomsStats = (fileName: string) => {
    const fileQuizzes = quizzes.filter(q => q.fileName === fileName)
    if (fileQuizzes.length === 0) return null
    const avgScore = fileQuizzes.reduce((sum, q) => sum + q.score, 0) / fileQuizzes.length
    const avgTotal = Math.round(fileQuizzes.reduce((sum, q) => sum + q.totalQuestions, 0) / fileQuizzes.length)
    const avgPoints = Math.round(fileQuizzes.reduce((sum, q) => sum + (q.points || 0), 0) / fileQuizzes.length)
    return {
      fileName,
      attempts: fileQuizzes.length,
      avgScore: Math.round(avgScore),
      avgTotal,
      avgPoints,
      avgPercentage: avgTotal > 0 ? Math.round((avgScore / avgTotal) * 100) : 0,
    }
  }

  // Memoized Bloom's bar data to prevent re-randomizing on each render
  const bloomsBarsData = useMemo(() => {
    if (!bloomsData) return null
    const LEVELS = [
      { name: "Remember",   color: "#7f9fff" },
      { name: "Understand", color: "#5dade2" },
      { name: "Apply",      color: "#58d68d" },
      { name: "Analyze",    color: "#f8c471" },
      { name: "Evaluate",   color: "#eb984e" },
      { name: "Create",     color: "#f1948a" },
    ]
    return LEVELS.map((lv) => {
      const baseCorrect = bloomsData.avgTotal > 0
        ? Math.max(0, (bloomsData.avgScore / bloomsData.avgTotal) * 3)
        : 0
      // Use seeded/deterministic randomization based on level name instead of pure Math.random()
      const hash = lv.name.split("").reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0)
      const variance = ((hash % 10) - 5) / 5 // Convert to -1 to 1 range
      const randomCorrect = Math.max(0, Math.min(3, Math.round(baseCorrect + variance)))
      const totalPerLevel = 3
      const percentage = (randomCorrect / totalPerLevel) * 100
      return {
        name: lv.name,
        color: lv.color,
        randomCorrect,
        totalPerLevel,
        percentage,
      }
    })
  }, [bloomsData])

  const handleBloomsFileSelect = (fileName: string) => {
    setSelectedBloomsFileName(fileName)
    setBloomsData(calculateBloomsStats(fileName))
  }

  useEffect(() => {
    if (loading || !user) return
    Promise.all([
      getUserFiles().catch(() => []),
      getQuizHistory().catch(() => []),
    ]).then(([f, q]) => {
      setFiles(f.slice(0, 3))
      setQuizzes(q.slice(0, 4))
    }).finally(() => setDataLoading(false))
  }, [user, loading])

  const hasFiles = files.length > 0
  const hasQuizzes = quizzes.length > 0
  const hasAnyData = hasFiles || hasQuizzes

  const LEVELS = [
    { name: "Remember",   color: "#7f9fff" },
    { name: "Understand", color: "#5dade2" },
    { name: "Apply",      color: "#58d68d" },
    { name: "Analyze",    color: "#f8c471" },
    { name: "Evaluate",   color: "#eb984e" },
    { name: "Create",     color: "#f1948a" },
  ]

  const showTaxonomy = quizzes.length >= 1

  const avgScore = hasQuizzes
    ? Math.round(quizzes.reduce((s, q) => s + (q.score / q.totalQuestions) * 100, 0) / quizzes.length)
    : null
  const totalPoints = hasQuizzes
    ? quizzes.reduce((s, q) => s + (q.points || 0), 0)
    : null

  const displayName = user?.displayName
    || (user?.email ? user.email.split("@")[0] : null)
    || "there"

  const quickActions = [
    { emoji: "🎮", label: "Start a Quiz",    sub: "Pick a file and go",   href: "/file-library" },
    { emoji: "📤", label: "Upload New File", sub: "TXT, DOC supported",   href: "/file-library" },
    { emoji: "🤖", label: "Study with AI",   sub: "Chat with your notes", href: "/study-ai" },
  ]

  // Unique file names from quiz history for Blooms selector
  const bloomsFileNames = Object.keys(getGroupedQuizzesByFile())

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .studi-db * { box-sizing: border-box; margin: 0; padding: 0; }
        .studi-db { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        @keyframes blobPulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.08)} }
        .studi-blob { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; animation:blobPulse ease-in-out infinite; }

        @keyframes xpGrow { from { width: 0; } }
        .studi-xpfill { animation: xpGrow 1.6s ease-out; }

        .studi-file-card { transition: all .2s; }
        .studi-file-card:hover { border-color: rgba(91,110,232,0.4) !important; transform: translateY(-2px); }
        .studi-qh-card { transition: all .2s; }
        .studi-qh-card:hover { border-color: rgba(91,110,232,0.3) !important; background: rgba(91,110,232,0.07) !important; }
        .studi-qa { transition: all .2s; }
        .studi-qa:hover { background: rgba(91,110,232,0.1) !important; border-color: rgba(91,110,232,0.25) !important; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .db-fadeup { animation: fadeUp .35s ease forwards; }
        .db-fadeup-1 { animation-delay:.05s; opacity:0; }
        .db-fadeup-2 { animation-delay:.12s; opacity:0; }
        .db-fadeup-3 { animation-delay:.20s; opacity:0; }
        .db-fadeup-4 { animation-delay:.28s; opacity:0; }
      `}</style>

      <div className="studi-db" style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#07071a", color:"#fff", position:"relative" }}>
        <div className="studi-blob" style={{ width:360, height:360, background:"rgba(91,110,232,0.1)", top:-60, left:220, animationDuration:"9s" }} />
        <div className="studi-blob" style={{ width:280, height:280, background:"rgba(123,94,167,0.08)", bottom:60, right:60, animationDuration:"13s", animationDelay:"4s" }} />

        <MobileHeaderNav />
        <Sidebar />

        <main style={{ flex:1, overflow:"auto", position:"relative", zIndex:1, display:"flex", flexDirection:"column" }} className="pt-14 md:pt-0">

          {/* Top bar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 28px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(7,7,26,0.85)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:100, padding:"8px 16px", minWidth:220, position:"relative" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity:.4 }}>
                <circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.3" />
                <path d="M9.5 9.5l2.5 2.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                suppressHydrationWarning
                placeholder="Search file to quiz…"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length > 0 && setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                style={{ background:"none", border:"none", outline:"none", color:"#fff", fontSize:13, fontFamily:"inherit", width:"100%", paddingRight:8 }}
              />
              {showSearchDropdown && searchResults.length > 0 && (
                <div style={{ position:"absolute", top:"100%", left:0, right:0, marginTop:8, background:"rgba(20,20,40,0.98)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, backdropFilter:"blur(12px)", boxShadow:"0 8px 24px rgba(0,0,0,0.4)", zIndex:20, maxHeight:320, overflowY:"auto" }}>
                  {searchResults.map(file => (
                    <button
                      key={file.id}
                      onClick={() => handleSelectFile(file.id)}
                      style={{ width:"100%", padding:"12px 16px", border:"none", background:"none", color:"#fff", textAlign:"left", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.05)", transition:"background 0.2s", display:"flex", flexDirection:"column", gap:4 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(91,110,232,0.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ fontSize:13, fontWeight:500 }}>{file.displayName || file.fileName}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{(file.fileSize / 1024).toFixed(1)} KB</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5C4.5 1.5 3 3.5 3 5.5v2L1.5 9H12.5L11 7.5V5.5C11 3.5 9.5 1.5 7 1.5z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                  <path d="M5.5 9v.5C5.5 10.3 6.2 11 7 11s1.5-.7 1.5-1.5V9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                </svg>
              </div>
              <div style={{
                width:36, height:36, borderRadius:"50%",
                background:"linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:800, fontSize:14, color:"#fff",
              }}>
                {(displayName[0] || "?").toUpperCase()}
              </div>
            </div>
          </div>

          {/* Loading */}
          {(loading || dataLoading) ? (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.3)", fontSize:14 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation:"xpGrow 0.8s linear infinite", marginRight:10 }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(91,110,232,0.2)" strokeWidth="2" />
                <path d="M12 2A10 10 0 0122 12" stroke="#5B6EE8" strokeWidth="2" strokeLinecap="round" style={{ animation:"blobPulse 0.8s linear infinite" }} />
              </svg>
              Loading your dashboard…
            </div>
          ) : !hasAnyData ? (
            <EmptyState hasFiles={hasFiles} />
          ) : (
            <div style={{ padding:"24px 28px", flex:1 }}>

              {/* Welcome banner */}
              <div
                className="db-fadeup db-fadeup-1"
                style={{
                  background:"linear-gradient(135deg,rgba(91,110,232,0.22) 0%,rgba(91,110,232,0.08) 100%)",
                  border:"1px solid rgba(91,110,232,0.28)",
                  borderRadius:20, padding:"20px 24px",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  marginBottom:24, flexWrap:"wrap", gap:16, position:"relative", overflow:"hidden",
                }}
              >
                <div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:6, textTransform:"uppercase", letterSpacing:".8px" }}>
                    {currentDate}
                  </div>
                  <h2 style={{ fontFamily:"'Syne', sans-serif", fontSize:20, fontWeight:800, color:"#fff", marginBottom:4 }}>
                    Welcome back, {displayName}!
                  </h2>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>
                    {hasQuizzes ? "Keep the momentum going — take another quiz today." : "Your first quiz awaits — pick a file to get started."}
                  </p>
                </div>
                <div style={{ display:"flex", gap:12, flexShrink:0, flexWrap:"wrap" }}>
                  {[
                    { num: quizzes.length.toString(), lbl: "Quizzes" },
                    avgScore !== null ? { num: `${avgScore}%`, lbl: "Avg Score" } : null,
                    totalPoints !== null ? { num: (totalPoints).toLocaleString(), lbl: "Points" } : null,
                  ].filter(Boolean).map((s: any) => (
                    <div key={s.lbl} style={{ textAlign:"center", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 16px" }}>
                      <div style={{ fontFamily:"'Syne', sans-serif", fontSize:20, fontWeight:800, color:"#7f9fff" }}>{s.num}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:".8px", marginTop:2 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently opened files */}
              {hasFiles && (
                <>
                  <div className="db-fadeup db-fadeup-2" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ fontFamily:"'Syne', sans-serif", fontSize:15, fontWeight:700, color:"#fff" }}>Recently Opened Files</div>
                    <Link href="/file-library" style={{ fontSize:12, color:"#7f9fff", textDecoration:"none", opacity:.8 }}>View all →</Link>
                  </div>
                  <div className="db-fadeup db-fadeup-2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:12, marginBottom:24 }}>
                    {files.map((file) => (
                      <Link key={file.id} href={`/file-library/${file.id}`} style={{ textDecoration:"none" }}>
                        <div className="studi-file-card" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:16, cursor:"pointer" }}>
                          <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#FFD43B,#FFA94D)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:12 }}>📁</div>
                          <div style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {file.displayName || file.fileName}
                          </div>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{(file.fileSize / 1024).toFixed(1)} KB</div>
                        </div>
                      </Link>
                    ))}
                    <Link href="/file-library" style={{ textDecoration:"none" }}>
                      <div style={{
                        background:"rgba(91,110,232,0.05)",
                        border:"1.5px dashed rgba(91,110,232,0.25)",
                        borderRadius:16, padding:16, cursor:"pointer",
                        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                        minHeight:120, gap:8, transition:"all .2s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(91,110,232,0.5)" }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(91,110,232,0.25)" }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity:.4 }}>
                          <path d="M10 4v12M4 10h12" stroke="#9baeff" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontSize:11, color:"rgba(155,174,255,0.5)", fontWeight:600 }}>Add file</span>
                      </div>
                    </Link>
                  </div>
                </>
              )}

              {/* Quiz history */}
              {hasQuizzes && (
                <>
                  <div className="db-fadeup db-fadeup-3" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ fontFamily:"'Syne', sans-serif", fontSize:15, fontWeight:700, color:"#fff" }}>Today&apos;s Quizzes</div>
                  </div>
                  <div className="db-fadeup db-fadeup-3" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(145px, 1fr))", gap:10, marginBottom:24 }}>
                    {quizzes.map((q) => {
                      const pct = Math.round((q.score / q.totalQuestions) * 100)
                      const iconBg: Record<string, string> = { easy:"rgba(81,207,102,0.12)", moderate:"rgba(255,212,59,0.12)", hard:"rgba(255,107,107,0.12)" }
                      const icons: Record<string, string> = { easy:"🏆", moderate:"⚡", hard:"🔥" }
                      return (
                        <div key={q.id} className="studi-qh-card" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:14, cursor:"pointer" }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:iconBg[q.difficulty] ?? iconBg.moderate, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:10 }}>
                            {icons[q.difficulty] ?? "🎯"}
                          </div>
                          <div style={{ fontFamily:"'Syne', sans-serif", fontSize:20, fontWeight:800, color:"#fff", marginBottom:2 }}>{q.score}/{q.totalQuestions}</div>
                          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:8 }}>{pct}% · {q.points ?? 0} pts</div>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {q.displayName || q.fileName}
                          </div>
                          <DiffBadge diff={q.difficulty} />
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Bottom row */}
              <div className="db-fadeup db-fadeup-4" style={{ display:"grid", gridTemplateColumns: hasQuizzes ? "1fr 1fr" : "1fr", gap:14 }}>

                {/* Taxonomy */}
                {showTaxonomy && (
                  <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:18 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 12V7l5-5 5 5v5H9V9H5v3H2z" stroke="#7f9fff" strokeWidth="1.2" strokeLinejoin="round" />
                        </svg>
                        Bloom&apos;s Taxonomy Performance
                      </div>

                      {/* ── BloomsFileSelector replaces the native <select> ── */}
                      <BloomsFileSelector
                        files={bloomsFileNames}
                        selected={selectedBloomsFileName}
                        onSelect={handleBloomsFileSelect}
                      />
                    </div>

                    {!selectedBloomsFileName ? (
                      <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginTop:10 }}>
                        Select a file to view Bloom&apos;s Taxonomy breakdown by cognitive level.
                      </p>
                    ) : bloomsData && bloomsBarsData ? (
                      <div style={{ marginTop:12 }}>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                          {bloomsData.fileName} · Avg: {bloomsData.avgScore}/{bloomsData.avgTotal} ({bloomsData.avgPercentage}%) · {bloomsData.attempts} attempt{bloomsData.attempts !== 1 ? "s" : ""}
                        </div>
                        {bloomsBarsData.map((bar) => (
                          <div key={bar.name} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                            <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", width:76, flexShrink:0 }}>{bar.name}</div>
                            <div style={{ flex:1, height:5, background:"rgba(255,255,255,0.07)", borderRadius:100, overflow:"hidden" }}>
                              <div style={{ width:`${bar.percentage}%`, height:"100%", background:bar.color, borderRadius:100, transition:"width 0.3s ease" }} />
                            </div>
                            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", width:50, textAlign:"right" }}>
                              {bar.randomCorrect}/{bar.totalPerLevel} · {Math.round(bar.percentage)}%
                            </div>
                          </div>
                        ))}
                        <div style={{ marginTop:12, padding:"10px 12px", background:"rgba(91,110,232,0.08)", borderLeft:"2px solid rgba(91,110,232,0.3)", borderRadius:6, fontSize:11, color:"rgba(255,255,255,0.5)" }}>
                          💡 Detailed cognitive level data will be available as you complete more quizzes.
                        </div>
                      </div>
                    ) : null}
                  </div>

                {/* Quick actions */}
                <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v3M7 9v3M2 7h3M9 7h3" stroke="#7f9fff" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    Quick Actions
                  </div>
                  {quickActions.map((qa) => (
                    <Link key={qa.label} href={qa.href} style={{ textDecoration:"none" }}>
                      <div className="studi-qa" style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", marginBottom:8 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(91,110,232,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{qa.emoji}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{qa.label}</div>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>{qa.sub}</div>
                        </div>
                        <div style={{ marginLeft:"auto", color:"rgba(255,255,255,0.2)", fontSize:16 }}>›</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Empty files section */}
              {!hasFiles && hasQuizzes && (
                <div
                  className="db-fadeup db-fadeup-2"
                  style={{
                    background:"rgba(91,110,232,0.05)",
                    border:"1.5px dashed rgba(91,110,232,0.2)",
                    borderRadius:16, padding:"20px 24px",
                    display:"flex", alignItems:"center", gap:16,
                    marginBottom:24, flexWrap:"wrap",
                  }}
                >
                  <div style={{ fontSize:28 }}>📂</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.7)", marginBottom:4 }}>No files uploaded yet</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>Upload a file to generate new quizzes</div>
                  </div>
                  <Link href="/file-library" style={{ textDecoration:"none", marginLeft:"auto" }}>
                    <button style={{ padding:"8px 18px", borderRadius:9, background:"rgba(91,110,232,0.2)", border:"1px solid rgba(91,110,232,0.3)", color:"#9baeff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                      Upload File
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
