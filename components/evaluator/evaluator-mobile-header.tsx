"use client"

import { useRouter, usePathname } from "next/navigation"

export default function EvaluatorMobileHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    sessionStorage.removeItem("isEvaluator")
    sessionStorage.removeItem("evaluatorName")
    router.push("/evaluator/login")
  }

  const navItems = [
    {
      path: "/evaluator/dashboard",
      title: "Home",
      icon: (
        <svg width="17" height="17" viewBox="0 0 13 13" fill="none">
          <path d="M1 7l5.5-5.5L12 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 5.5V11h3V8h2v3h3V5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      path: "/evaluator/quizzes",
      title: "All",
      icon: (
        <svg width="17" height="17" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".7" />
          <rect x="7" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".4" />
          <rect x="1" y="7" width="5" height="5" rx="1" fill="currentColor" opacity=".4" />
          <rect x="7" y="7" width="5" height="5" rx="1" fill="currentColor" opacity=".4" />
        </svg>
      ),
    },
    {
      path: "/evaluator/pending",
      title: "Pending",
      icon: (
        <svg width="17" height="17" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6.5 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      path: "/evaluator/evaluated",
      title: "Done",
      icon: (
        <svg width="17" height="17" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      path: "/evaluator/profile",
      title: "Profile",
      icon: (
        <svg width="17" height="17" viewBox="0 0 13 13" fill="none">
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
        .ev-mob { font-family: 'DM Sans', sans-serif; }
      `}</style>
      <div
        className="ev-mob md:hidden fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(13,13,43,0.95)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
          {/* Logo */}
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            STU<span style={{ color: "#7f9fff" }}>DI</span>
          </span>

          {/* Nav icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {navItems.map((item) => {
              const active = pathname === item.path
              return (
                <button
                  key={item.path}
                  suppressHydrationWarning
                  onClick={() => router.push(item.path)}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: active ? "rgba(91,110,232,0.18)" : "transparent",
                    border: active ? "1px solid rgba(91,110,232,0.25)" : "1px solid transparent",
                    color: active ? "#9baeff" : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all .15s",
                  }}
                  title={item.title}
                >
                  {item.icon}
                </button>
              )
            })}
            {/* Logout */}
            <button
              suppressHydrationWarning
              onClick={handleLogout}
              style={{
                padding: "6px 8px", borderRadius: 8,
                background: "transparent", border: "1px solid transparent",
                color: "rgba(255,107,107,0.6)", cursor: "pointer",
                display: "flex", alignItems: "center", transition: "all .15s",
              }}
              title="Sign Out"
            >
              <svg width="17" height="17" viewBox="0 0 13 13" fill="none">
                <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3M8.5 9l3-2.5-3-2.5M11.5 6.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}