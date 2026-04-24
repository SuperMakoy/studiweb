"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getQuizzesForEvaluation } from "@/lib/evaluation-service"

export default function EvaluatorSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [stats, setStats] = useState({ total: 0, pending: 0, evaluated: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const quizzes = await getQuizzesForEvaluation()
        const pending = quizzes.filter(q => q.evaluationStatus === "pending").length
        const evaluated = quizzes.filter(q => q.evaluationStatus === "evaluated").length
        setStats({ total: quizzes.length, pending, evaluated })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
    fetchStats()
  }, [pathname])

  const handleLogout = () => {
    sessionStorage.removeItem("isEvaluator")
    sessionStorage.removeItem("evaluatorName")
    router.push("/evaluator/login")
  }

  const isActive = (path: string) => pathname === path
  const isEvalActive = pathname.startsWith("/evaluator/evaluate") || pathname.startsWith("/evaluator/view")

  const libraryItems = [
    {
      label: "All Quizzes",
      path: "/evaluator/quizzes",
      count: stats.total,
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".7" />
          <rect x="7" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".4" />
          <rect x="1" y="7" width="5" height="5" rx="1" fill="currentColor" opacity=".4" />
          <rect x="7" y="7" width="5" height="5" rx="1" fill="currentColor" opacity=".4" />
        </svg>
      ),
    },
    {
      label: "Pending",
      path: "/evaluator/pending",
      count: stats.pending,
      countColor: "#FFD43B",
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6.5 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Evaluated",
      path: "/evaluator/evaluated",
      count: stats.evaluated,
      countColor: "#51CF66",
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  const toolItems = [
    {
      label: "Dashboard",
      path: "/evaluator/dashboard",
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M1 7l5.5-5.5L12 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 5.5V11h3V8h2v3h3V5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Profile",
      path: "/evaluator/profile",
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1.5 11.5c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .ev-sidebar { font-family: 'DM Sans', sans-serif; }
        .ev-nav-item {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 10px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all .15s;
          color: rgba(255,255,255,0.45);
          border: 1px solid transparent;
          text-decoration: none; width: 100%;
          background: none;
          font-family: 'DM Sans', sans-serif;
        }
        .ev-nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }
        .ev-nav-item.active {
          background: rgba(91,110,232,0.18);
          border-color: rgba(91,110,232,0.25);
          color: #9baeff;
        }
        .ev-section-label {
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.22);
          letter-spacing: 1.4px;
          text-transform: uppercase;
          padding: 0 10px;
          margin-bottom: 4px;
          margin-top: 16px;
        }
        .ev-logout {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px; border-radius: 8px;
          font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .15s;
          color: rgba(255,107,107,0.65);
          background: none; border: none;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
        }
        .ev-logout:hover { background: rgba(255,107,107,0.08); color: rgba(255,107,107,0.9); }
      `}</style>

      <aside
        className="ev-sidebar hidden md:flex flex-col h-screen flex-shrink-0"
        style={{
          width: 200,
          background: "#0d0d2b",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          position: "sticky",
          top: 0,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "22px 16px 12px" }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            STU<span style={{ color: "#7f9fff" }}>DI</span>
          </span>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 2 }}>
            Evaluator Portal
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 0" }}>

          <div className="ev-section-label" style={{ marginTop: 12 }}>Library</div>
          {libraryItems.map((item) => (
            <button
              key={item.path}
              className={`ev-nav-item${isActive(item.path) ? " active" : ""}`}
              onClick={() => router.push(item.path)}
            >
              <span style={{ flexShrink: 0, opacity: isActive(item.path) ? 1 : 0.6 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== undefined && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: isActive(item.path) ? "#9baeff" : (item.countColor || "rgba(255,255,255,0.3)"),
                  background: isActive(item.path) ? "rgba(91,110,232,0.2)" : "rgba(255,255,255,0.06)",
                  borderRadius: 100, padding: "1px 7px",
                  minWidth: 20, textAlign: "center",
                }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}

          <div className="ev-section-label">Tools</div>
          {toolItems.map((item) => (
            <button
              key={item.path}
              className={`ev-nav-item${isActive(item.path) ? " active" : ""}`}
              onClick={() => router.push(item.path)}
            >
              <span style={{ flexShrink: 0, opacity: isActive(item.path) ? 1 : 0.6 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          {/* Disk usage / progress block */}
          <div style={{ margin: "16px 2px 8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
              <span>Progress</span>
              <span>{stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${stats.total > 0 ? (stats.evaluated / stats.total) * 100 : 0}%`,
                background: "linear-gradient(90deg,#5B6EE8,#51CF66)",
                borderRadius: 100,
                transition: "width .6s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 9, color: "#FFD43B", fontWeight: 600 }}>{stats.pending} pending</span>
              <span style={{ fontSize: 9, color: "#51CF66", fontWeight: 600 }}>{stats.evaluated} done</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 8px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            marginBottom: 6,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>E</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Evaluator</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Taxonomy Expert</div>
            </div>
          </div>
          <button suppressHydrationWarning className="ev-logout" onClick={handleLogout}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3M8.5 9l3-2.5-3-2.5M11.5 6.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}