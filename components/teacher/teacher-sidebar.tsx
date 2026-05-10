"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

export default function TeacherSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [quizzesOpen, setQuizzesOpen] = useState(true)

  // Static mock data for prototype
  const stats = { total: 12, published: 8, drafts: 4 }

  const handleLogout = () => {
    sessionStorage.removeItem("isTeacher")
    sessionStorage.removeItem("teacherName")
    router.push("/teacher/login")
  }

  const isActive = (path: string) => pathname === path
  const isDashActive =
    pathname === "/teacher/dashboard" ||
    pathname.startsWith("/teacher/quizzes") ||
    pathname.startsWith("/teacher/published") ||
    pathname.startsWith("/teacher/drafts")

  const subItems = [
    {
      label: "All Quizzes",
      path: "/teacher/quizzes",
      count: stats.total,
      countColor: "rgba(125,206,160,0.8)",
      dot: "#7dcea0",
    },
    {
      label: "Published",
      path: "/teacher/published",
      count: stats.published,
      countColor: "#51CF66",
      dot: "#51CF66",
    },
    {
      label: "Drafts",
      path: "/teacher/drafts",
      count: stats.drafts,
      countColor: "#FFD43B",
      dot: "#FFD43B",
    },
  ]

  const toolItems = [
    {
      label: "Students",
      path: "/teacher/students",
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="4.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 11c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8.5 7.5c2 0 3.5 1.5 3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Analytics",
      path: "/teacher/analytics",
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="7" width="2.5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="5.25" y="4" width="2.5" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="9.5" y="1" width="2.5" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ),
    },
    {
      label: "Profile",
      path: "/teacher/profile",
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
        .tc-sidebar { font-family: 'DM Sans', sans-serif; }
        .tc-nav-item {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 10px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all .15s;
          color: rgba(255,255,255,0.45);
          border: 1px solid transparent;
          text-decoration: none; width: 100%;
          background: none; font-family: 'DM Sans', sans-serif;
        }
        .tc-nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }
        .tc-nav-item.active {
          background: rgba(88,214,141,0.18);
          border-color: rgba(88,214,141,0.25);
          color: #7dcea0;
        }
        .tc-section-label {
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.22);
          letter-spacing: 1.4px; text-transform: uppercase;
          padding: 0 10px; margin-bottom: 4px; margin-top: 16px;
        }
        .tc-logout {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px; border-radius: 8px;
          font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .15s;
          color: rgba(255,107,107,0.65);
          background: none; border: none;
          font-family: 'DM Sans', sans-serif; width: 100%;
        }
        .tc-logout:hover { background: rgba(255,107,107,0.08); color: rgba(255,107,107,0.9); }

        /* subtree */
        .tc-subtree {
          margin-left: 10px;
          border-left: 1px solid rgba(255,255,255,0.07);
          padding-left: 6px;
          margin-top: 2px;
          display: flex; flex-direction: column; gap: 1px;
        }
        .tc-sub-item {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 8px; border-radius: 7px;
          font-size: 12px; font-weight: 500;
          cursor: pointer; transition: all .15s;
          color: rgba(255,255,255,0.38);
          border: 1px solid transparent;
          background: none; font-family: 'DM Sans', sans-serif;
          width: 100%; text-align: left;
          position: relative;
        }
        .tc-sub-item::before {
          content: '';
          position: absolute; left: -7px; top: 50%;
          width: 6px; height: 1px;
          background: rgba(255,255,255,0.1);
          transform: translateY(-50%);
        }
        .tc-sub-item:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.65); }
        .tc-sub-item.active {
          background: rgba(88,214,141,0.14);
          border-color: rgba(88,214,141,0.2);
          color: #7dcea0;
        }

        @keyframes tcSubSlide {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-subtree { animation: tcSubSlide .18s ease forwards; }
      `}</style>

      <aside
        className="tc-sidebar hidden md:flex flex-col h-screen flex-shrink-0"
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
            STU<span style={{ color: "#58d68d" }}>DI</span>
          </span>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 2 }}>
            Teacher Portal
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 0" }}>

          {/* LIBRARY section */}
          <div className="tc-section-label" style={{ marginTop: 12 }}>Library</div>

          {/* Dashboard parent with collapse toggle */}
          <div>
            <button
              className={`tc-nav-item${isDashActive ? " active" : ""}`}
              onClick={() => {
                router.push("/teacher/dashboard")
                setQuizzesOpen(v => !v)
              }}
              style={{ justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 7l5.5-5.5L12 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.5 5.5V11h3V8h2v3h3V5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Dashboard</span>
              </div>
              {/* Chevron */}
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="none"
                style={{ transform: quizzesOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform .2s ease", opacity: 0.4, flexShrink: 0 }}
              >
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Subtree */}
            {quizzesOpen && (
              <div className="tc-subtree">
                {subItems.map(item => (
                  <button
                    key={item.path}
                    suppressHydrationWarning
                    className={`tc-sub-item${isActive(item.path) ? " active" : ""}`}
                    onClick={() => router.push(item.path)}
                  >
                    {/* Status dot */}
                    <div style={{
                      width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                      background: isActive(item.path) ? item.dot : "rgba(255,255,255,0.2)",
                      transition: "background .15s",
                    }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {/* Count badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: isActive(item.path) ? item.countColor : "rgba(255,255,255,0.25)",
                      background: isActive(item.path) ? "rgba(88,214,141,0.15)" : "rgba(255,255,255,0.05)",
                      borderRadius: 100, padding: "1px 6px",
                      minWidth: 18, textAlign: "center",
                      transition: "all .15s",
                    }}>
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TOOLS section */}
          <div className="tc-section-label">Tools</div>
          {toolItems.map(item => (
            <button
              key={item.path}
              className={`tc-nav-item${isActive(item.path) ? " active" : ""}`}
              onClick={() => router.push(item.path)}
            >
              <span style={{ flexShrink: 0, opacity: isActive(item.path) ? 1 : 0.6 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          {/* Stats block */}
          <div style={{ margin: "16px 2px 8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
              <span>Quizzes Created</span>
              <span>{stats.total}</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${stats.total > 0 ? (stats.published / stats.total) * 100 : 0}%`,
                background: "linear-gradient(90deg,#58d68d,#51CF66)",
                borderRadius: 100, transition: "width .6s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 9, color: "#FFD43B", fontWeight: 600 }}>{stats.drafts} drafts</span>
              <span style={{ fontSize: 9, color: "#51CF66", fontWeight: 600 }}>{stats.published} published</span>
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
              background: "linear-gradient(135deg,#58d68d,#45b078)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>T</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Teacher</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Quiz Creator</div>
            </div>
          </div>
          <button suppressHydrationWarning className="tc-logout" onClick={handleLogout}>
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
