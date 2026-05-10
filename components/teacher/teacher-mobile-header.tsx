"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function TeacherMobileHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    sessionStorage.removeItem("isTeacher")
    sessionStorage.removeItem("teacherName")
    router.push("/teacher/login")
  }

  const navItems = [
    { label: "Dashboard", path: "/teacher/dashboard" },
    { label: "File Library", path: "/teacher/library" },
    { label: "Create Quiz", path: "/teacher/create-quiz" },
    { label: "All Quizzes", path: "/teacher/quizzes" },
    { label: "Published", path: "/teacher/published" },
    { label: "Drafts", path: "/teacher/drafts" },
    { label: "Analytics", path: "/teacher/analytics" },
    { label: "Profile", path: "/teacher/profile" },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .tc-mobile-header { font-family: 'DM Sans', sans-serif; }
        
        @keyframes tcSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-mobile-menu { animation: tcSlideDown .2s ease forwards; }
        
        .tc-mobile-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 10px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all .15s;
          color: rgba(255,255,255,0.5);
          border: 1px solid transparent;
          background: none; width: 100%;
          font-family: 'DM Sans', sans-serif;
          text-align: left;
        }
        .tc-mobile-nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .tc-mobile-nav-item.active {
          background: rgba(88,214,141,0.15);
          border-color: rgba(88,214,141,0.25);
          color: #7dcea0;
        }
      `}</style>

      {/* Mobile header bar */}
      <div
        className="tc-mobile-header md:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "rgba(13,13,43,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
          STU<span style={{ color: "#58d68d" }}>DI</span>
        </span>

        {/* Menu button */}
        <button
          suppressHydrationWarning
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "8px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {menuOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div
          className="tc-mobile-menu md:hidden"
          style={{
            position: "fixed",
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
            background: "rgba(7,7,26,0.98)",
            backdropFilter: "blur(16px)",
            padding: "16px",
            overflowY: "auto",
          }}
        >
          {/* Portal badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(88,214,141,0.15)",
              border: "1px solid rgba(88,214,141,0.3)",
              borderRadius: 100,
              padding: "4px 12px",
              marginBottom: 16,
              fontSize: 10,
              fontWeight: 700,
              color: "#7dcea0",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Teacher Portal
          </div>

          {/* Nav items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {navItems.map(item => (
              <button
                key={item.path}
                className={`tc-mobile-nav-item${isActive(item.path) ? " active" : ""}`}
                onClick={() => {
                  router.push(item.path)
                  setMenuOpen(false)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

          {/* Logout */}
          <button
            suppressHydrationWarning
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,107,107,0.8)",
              background: "rgba(255,107,107,0.08)",
              border: "1px solid rgba(255,107,107,0.15)",
              cursor: "pointer",
              width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </>
  )
}
