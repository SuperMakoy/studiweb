"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

export default function Sidebar() {
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .studi-sidebar { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .studi-sidebar-navitem:hover {
          background: rgba(255,255,255,0.05) !important;
          color: rgba(255,255,255,0.85) !important;
        }
      `}</style>
      <aside
        className="studi-sidebar hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0"
        style={{
          width: 200,
          background: "#0d0d2b",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px" }}>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: -0.5,
            }}
          >
            STU<span style={{ color: "#7f9fff" }}>DI</span>
          </span>
        </div>

        {/* Nav label */}
        <div
          style={{
            padding: "8px 20px 4px",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            fontWeight: 600,
          }}
        >
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
                className="studi-sidebar-navitem"
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
                  border: active
                    ? "1px solid rgba(91,110,232,0.25)"
                    : "1px solid transparent",
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
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Progress
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                marginBottom: 4,
              }}
            >
              Overall Level
            </div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#7f9fff",
              }}
            >
              Lv. 12
            </div>
            <div
              style={{
                marginTop: 8,
                height: 4,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 100,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "68%",
                  height: "100%",
                  background: "linear-gradient(90deg,#5B6EE8,#9b7fe8)",
                  borderRadius: 100,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                marginTop: 4,
              }}
            >
              680 / 1000 XP
            </div>
          </div>
        </div>

        {/* User + logout */}
        <div style={{ marginTop: "auto", padding: "16px 8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#51CF66,#37b24d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              M
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                Makoy
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                Scholar
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,107,107,0.8)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all .2s",
              fontFamily: "inherit",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M13 7H5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}